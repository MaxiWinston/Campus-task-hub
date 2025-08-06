import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  Phone, 
  Video, 
  MoreVertical,
  Search,
  Star,
  Clock,
  CheckCircle,
  Paperclip,
  Smile
} from "lucide-react";

const Chat = () => {
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState(id || "1");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "other",
      content: "Hi! Thanks for applying to help with my chemistry lab report. Are you available to meet today?",
      time: "2:30 PM",
      status: "delivered"
    },
    {
      id: 2,
      sender: "me",
      content: "Hi Sarah! Yes, I'm available today. What time works best for you?",
      time: "2:32 PM",
      status: "delivered"
    },
    {
      id: 3,
      sender: "other",
      content: "How about 4 PM at the North Campus Library? I have all my materials ready.",
      time: "2:35 PM",
      status: "delivered"
    },
    {
      id: 4,
      sender: "me",
      content: "That sounds perfect! I'll be there at 4 PM. Should I bring anything specific?",
      time: "2:37 PM",
      status: "delivered"
    },
    {
      id: 5,
      sender: "other",
      content: "Just bring your knowledge of derivatives and integrals 😊 I'm particularly struggling with the chain rule.",
      time: "2:40 PM",
      status: "delivered"
    },
    {
      id: 6,
      sender: "me",
      content: "Got it! The chain rule can be tricky but I'll make sure to explain it clearly. See you at 4!",
      time: "2:42 PM",
      status: "read"
    },
    {
      id: 7,
      sender: "other",
      content: "How's the lab report going?",
      time: "Just now",
      status: "delivered"
    }
  ]);

  const [chats, setChats] = useState([
    {
      id: "1",
      name: "Sarah Martinez",
      lastMessage: "How's the lab report going?",
      time: "2 min ago",
      unread: 2,
      avatar: "/placeholder.svg",
      online: true,
      taskTitle: "Help with Chemistry Lab Report"
    },
    {
      id: "2",
      name: "Mike Rodriguez",
      lastMessage: "I'm at the store now",
      time: "15 min ago",
      unread: 0,
      avatar: "/placeholder.svg",
      online: true,
      taskTitle: "Food Delivery from Campus Store"
    },
    {
      id: "3",
      name: "Alex Kim",
      lastMessage: "What time works for you?",
      time: "1 hour ago",
      unread: 1,
      avatar: "/placeholder.svg",
      online: false,
      taskTitle: "Moving Help - Dorm to Apartment"
    },
    {
      id: "4",
      name: "Emma Wilson",
      lastMessage: "Perfect! See you at the library",
      time: "2 hours ago",
      unread: 0,
      avatar: "/placeholder.svg",
      online: false,
      taskTitle: "Calculus Tutoring Session"
    },
    {
      id: "5",
      name: "James Chen",
      lastMessage: "Thanks for the help!",
      time: "1 day ago",
      unread: 0,
      avatar: "/placeholder.svg",
      online: false,
      taskTitle: "Laptop Setup and Configuration"
    }
  ]);

  const currentChat = chats.find(chat => chat.id === selectedChat);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now(), // Use timestamp for unique ID
        sender: "me",
        content: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "delivered"
      };

      // Add new message to messages
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      // Update last message in chats
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChat 
            ? { 
                ...chat, 
                lastMessage: message.length > 30 ? `${message.substring(0, 30)}...` : message,
                time: 'Just now',
                unread: 0
              } 
            : chat
        )
      );
      
      setMessage("");
    }
  };

  // Update chat selection and mark messages as read
  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId);
    
    // Mark messages as read when selecting a chat
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId 
          ? { ...chat, unread: 0 }
          : chat
      )
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Chat List */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-800">Messages</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Search conversations..." className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedChat === chat.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={chat.avatar} />
                        <AvatarFallback>{chat.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-800 truncate">{chat.name}</h4>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">{chat.time}</span>
                          {chat.unread > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                              {chat.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                      <p className="text-xs text-gray-500 mt-1 truncate">{chat.taskTitle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <div className="lg:col-span-2">
          {currentChat ? (
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={currentChat.avatar} />
                        <AvatarFallback>{currentChat.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      {currentChat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{currentChat.name}</h3>
                      <p className="text-sm text-gray-600">{currentChat.taskTitle}</p>
                      <p className="text-xs text-gray-500">
                        {currentChat.online ? 'Online' : 'Last seen 2 hours ago'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <Separator />

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === 'me'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${
                        msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">{msg.time}</span>
                        {msg.sender === 'me' && (
                          <div className="flex">
                            <CheckCircle className="h-3 w-3" />
                            {msg.status === 'read' && <CheckCircle className="h-3 w-3 -ml-1" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }} className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button type="submit" size="sm" disabled={!message.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a chat from the list to start messaging</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
