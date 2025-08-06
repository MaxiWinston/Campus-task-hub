import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

// Get all messages for a task
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user has access to this task's messages
    const { data: taskAccess, error: accessError } = await supabase
      .from('tasks')
      .select('id, requester_id, assignee_id')
      .or(`requester_id.eq.${session.user.id},assignee_id.eq.${session.user.id}`)
      .eq('id', taskId)
      .maybeSingle();

    if (accessError) throw accessError;
    
    const { data: userData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    const isAdmin = userData?.is_admin || false;

    if (!taskAccess && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to view these messages' },
        { status: 403 }
      );
    }

    // Get messages with sender info
    const { data: messages, error } = await supabase
      .from('task_messages')
      .select(
        `
        *,
        sender:profiles!task_messages_sender_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Mark unread messages as read if the current user is the recipient
    const unreadMessageIds = messages
      .filter(msg => 
        msg.sender_id !== session.user.id && 
        !msg.read_by?.includes(session.user.id)
      )
      .map(msg => msg.id);

    if (unreadMessageIds.length > 0) {
      await supabase.rpc('mark_messages_as_read', {
        p_message_ids: unreadMessageIds,
        p_user_id: session.user.id
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: messages.reverse() // Return in chronological order
    });
  } catch (error: any) {
    console.error('Error fetching task messages:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while fetching messages' 
      },
      { status: 500 }
    );
  }
}

// Send a new message for a task
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { content, file } = await request.json();

    // Validate input
    if (!content?.trim() && !file) {
      return NextResponse.json(
        { success: false, error: 'Message content or file is required' },
        { status: 400 }
      );
    }

    // Check if user has access to this task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, status, requester_id, assignee_id')
      .or(`requester_id.eq.${session.user.id},assignee_id.eq.${session.user.id}`)
      .eq('id', taskId)
      .maybeSingle();

    if (taskError) throw taskError;
    
    const { data: userData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    const isAdmin = userData?.is_admin || false;

    if (!task && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to send messages for this task' },
        { status: 403 }
      );
    }

    // If task is completed, only allow messages if enabled in settings
    if (task.status === 'completed' && !isAdmin) {
      const { data: settings } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'allow_messages_after_completion')
        .single();

      if (!settings?.value) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Messaging is disabled for completed tasks' 
          },
          { status: 400 }
        );
      }
    }

    let fileUrl = null;
    let fileName = null;
    let fileType = null;

    // Handle file upload if present
    if (file) {
      // In a real implementation, you would handle the file upload here
      // This is a simplified example
      const fileExt = file.name.split('.').pop();
      const fileName = `${taskId}_${Date.now()}.${fileExt}`;
      const filePath = `task-files/${taskId}/${fileName}`;
      
      // Convert base64 to buffer
      const fileBuffer = Buffer.from(file.data.split(',')[1], 'base64');
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('task-files')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error('Failed to upload file');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('task-files')
        .getPublicUrl(uploadData.path);

      fileUrl = publicUrl;
      fileName = file.name;
      fileType = file.type;
    }

    // Create the message
    const { data: message, error: messageError } = await supabase
      .from('task_messages')
      .insert([
        {
          task_id: taskId,
          sender_id: session.user.id,
          content: content?.trim() || null,
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileType,
          read_by: [session.user.id] // Mark as read by sender
        },
      ])
      .select(
        `
        *,
        sender:profiles!task_messages_sender_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .single();

    if (messageError) throw messageError;

    // Get the other user's ID (either requester or assignee)
    const recipientId = 
      task.requester_id === session.user.id 
        ? task.assignee_id 
        : task.requester_id;

    // Create a notification for the recipient if different from sender
    if (recipientId && recipientId !== session.user.id) {
      await supabase.from('user_notifications').insert([
        {
          user_id: recipientId,
          type: 'new_message',
          title: 'New message',
          message: `You have a new message in task #${taskId}`,
          data: {
            task_id: taskId,
            sender_id: session.user.id,
            message_id: message.id
          },
          is_read: false
        },
      ]);

      // In a real app, you would also send a push notification here
    }

    return NextResponse.json({ 
      success: true, 
      data: message 
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while sending the message' 
      },
      { status: 500 }
    );
  }
}
