import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  TrendingUp,
  Search,
  Filter,
  Eye,
  Ban,
  MessageSquare,
  Calendar,
  BarChart3,
  Activity
} from "lucide-react";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const stats = [
    { label: "Total Users", value: "2,431", change: "+12%", icon: Users, color: "text-blue-600" },
    { label: "Active Tasks", value: "187", change: "+5%", icon: Activity, color: "text-green-600" },
    { label: "Revenue", value: "₵12,450", change: "+18%", icon: DollarSign, color: "text-purple-600" },
    { label: "Reports", value: "23", change: "-8%", icon: AlertTriangle, color: "text-red-600" },
  ];

  const recentUsers = [
    { id: 1, name: "Sarah Martinez", email: "sarah.m@university.edu", joinDate: "2 days ago", status: "active", tasksCompleted: 15 },
    { id: 2, name: "Mike Rodriguez", email: "mike.r@university.edu", joinDate: "1 week ago", status: "active", tasksCompleted: 8 },
    { id: 3, name: "Emma Wilson", email: "emma.w@university.edu", joinDate: "2 weeks ago", status: "suspended", tasksCompleted: 3 },
    { id: 4, name: "James Chen", email: "james.c@university.edu", joinDate: "1 month ago", status: "active", tasksCompleted: 42 },
  ];

  const reportedTasks = [
    {
      id: 1,
      title: "Suspicious Payment Request",
      reporter: "Alex Kim",
      reported: "John Doe",
      reason: "Asking for payment outside platform",
      date: "2 hours ago",
      status: "pending"
    },
    {
      id: 2,
      title: "Inappropriate Content",
      reporter: "Lisa Park",
      reported: "Mark Johnson",
      reason: "Inappropriate language in chat",
      date: "1 day ago",
      status: "resolved"
    },
    {
      id: 3,
      title: "Task Not Completed",
      reporter: "David Lee",
      reported: "Anna Smith",
      reason: "Task marked complete but not done",
      date: "3 days ago",
      status: "investigating"
    }
  ];

  const platformMetrics = [
    { metric: "Daily Active Users", value: "1,234", trend: "up" },
    { metric: "Tasks Created Today", value: "45", trend: "up" },
    { metric: "Tasks Completed Today", value: "38", trend: "down" },
    { metric: "Revenue Today", value: "₵567", trend: "up" },
    { metric: "Average Task Price", value: "₵23", trend: "up" },
    { metric: "User Satisfaction", value: "4.8/5", trend: "up" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "suspended": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "investigating": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage users, monitor activities, and oversee platform operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Users</CardTitle>
                    <CardDescription>Newest members of the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentUsers.slice(0, 3).map((user) => (
                        <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">{user.name.charAt(0)}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{user.name}</h4>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">{user.joinDate}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Reports */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reports</CardTitle>
                    <CardDescription>Latest user reports requiring attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportedTasks.slice(0, 3).map((report) => (
                        <div key={report.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-800">{report.title}</h4>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{report.reason}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Reported by {report.reporter}</span>
                            <span>{report.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                      <Users className="h-6 w-6 mb-2" />
                      <span>View All Users</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                      <AlertTriangle className="h-6 w-6 mb-2" />
                      <span>Review Reports</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                      <BarChart3 className="h-6 w-6 mb-2" />
                      <span>Analytics</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                      <MessageSquare className="h-6 w-6 mb-2" />
                      <span>Send Announcement</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search users..." className="pl-10" />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">{user.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">Joined {user.joinDate} • {user.tasksCompleted} tasks completed</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Ban className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="space-y-4">
                {reportedTasks.map((report) => (
                  <div key={report.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-800">{report.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{report.reason}</p>
                      </div>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>Reporter: {report.reporter}</span>
                      <span>Reported: {report.reported}</span>
                      <span>{report.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm">Investigate</Button>
                      <Button variant="outline" size="sm">Contact Reporter</Button>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {platformMetrics.map((metric, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">{metric.metric}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-800">{metric.value}</span>
                        <TrendingUp className={`h-4 w-4 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Health</CardTitle>
                  <CardDescription>Overall system performance and user engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-gray-800">System Status: Healthy</h3>
                      <p className="text-sm text-gray-600">All systems operational, user satisfaction high</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">99.9%</div>
                        <div className="text-sm text-gray-600">Uptime</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">0.2s</div>
                        <div className="text-sm text-gray-600">Avg Response Time</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
