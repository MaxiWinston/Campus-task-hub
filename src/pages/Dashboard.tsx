import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
// The useAuth and supabase imports have been removed as they are no longer needed.
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar, CheckCircle, Clock, AlertCircle, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Removed the profile state and loading state as the data is now static
  const { toast } = useToast();

  // Static user profile data to replace the backend fetch
  const profile = {
    full_name: 'Jane Doe',
  };

  // Mock data for the dashboard UI
  const activeTasks = [
    {
      id: 1,
      title: "Help with Chemistry Lab Report",
      type: "Academic Help",
      status: "In Progress",
      price: 25,
      deadline: "Tomorrow",
      requester: "Sarah M.",
      progress: 60
    },
    {
      id: 2,
      title: "Food Delivery from Campus Store",
      type: "Food & Delivery",
      status: "Pending",
      price: 8,
      deadline: "Today",
      requester: "Mike R.",
      progress: 0
    },
    {
      id: 3,
      title: "Moving Help - Dorm to Apartment",
      type: "Moving & Logistics",
      status: "Accepted",
      price: 45,
      deadline: "This Weekend",
      requester: "Alex K.",
      progress: 20
    }
  ];

  const recentChats = [
    { id: 1, name: "Sarah M.", message: "How's the lab report going?", time: "2 min ago", unread: true },
    { id: 2, name: "Mike R.", message: "I'm at the store now", time: "15 min ago", unread: false },
    { id: 3, name: "Alex K.", message: "What time works for you?", time: "1 hour ago", unread: true },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || 'Student'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your tasks today.</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
          <Link to="/tasks/create">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              75% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              2 due this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Tasks */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-gray-800">Active Tasks</CardTitle>
                <CardDescription>Tasks you're currently working on</CardDescription>
              </div>
              <Button asChild>
                <Link to="/tasks/create" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Task
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeTasks.map((task) => (
                <div key={task.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 mb-1">{task.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Badge variant="outline" className="text-xs">{task.type}</Badge>
                        <span>•</span>
                        <span>by {task.requester}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-800">₵{task.price}</div>
                      <Badge variant={task.status === 'In Progress' ? 'default' : task.status === 'Pending' ? 'secondary' : 'outline'}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {task.deadline}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{task.progress}% complete</span>
                      <Progress value={task.progress} className="w-20" />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/tasks">View All Tasks</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-gray-800">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" asChild>
                <Link to="/tasks/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Task
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/tasks">
                  <Clock className="h-4 w-4 mr-2" />
                  Browse Available Tasks
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/profile">
                  <Star className="h-4 w-4 mr-2" />
                  Update Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Chats */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-gray-800">Recent Chats</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/chat">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentChats.map((chat) => (
                <div key={chat.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{chat.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800 text-sm">{chat.name}</p>
                      <span className="text-xs text-gray-500">{chat.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{chat.message}</p>
                  </div>
                  {chat.unread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-gray-800">This Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tasks Completed</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Earnings</span>
                <span className="font-medium text-green-600">₵89.50</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="font-medium">Less than 2 hours</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>+12% from last week</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
