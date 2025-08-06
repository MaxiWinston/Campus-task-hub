import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  MessageCircle,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Coffee,
  Laptop,
  Package,
  Car,
  Heart,
  Share2,
  Flag
} from "lucide-react";
import { toast } from "sonner";

const TaskDetails = () => {
  const { id } = useParams();
  const [isApplied, setIsApplied] = useState(false);

  // Mock task data - in real app, this would come from API
  const task = {
    id: 1,
    title: "Help with Calculus Assignment",
    description: "I'm struggling with my calculus homework and need someone who can explain derivatives and integrals clearly. The assignment is due tomorrow and I'm particularly having trouble with the chain rule and integration by parts. Looking for someone who can meet me at the library and walk through the problems step by step. I have all the materials ready and just need someone patient who can explain the concepts in a way that makes sense.",
    category: "Academic Help",
    price: 25,
    location: "North Campus Library",
    timePosted: "2 hours ago",
    deadline: "Tomorrow 11:59 PM",
    requester: {
      name: "Sarah Martinez",
      rating: 4.8,
      tasksCompleted: 15,
      joinDate: "September 2023",
      avatar: "/placeholder.svg"
    },
    urgency: "Medium",
    applicants: 3,
    requirements: ["Strong math background", "Available today/tomorrow", "Patient teaching style"],
    isFlexible: true,
    contactMethod: "chat",
    status: "Open"
  };

  const applicants = [
    {
      id: 1,
      name: "Alex Chen",
      rating: 4.9,
      experience: "Math Tutor, 3 years",
      price: 25,
      message: "Hi! I'm a math major and have been tutoring calculus for 3 years. I'd love to help you with derivatives and integrals. I'm available this evening.",
      responseTime: "Usually responds within 1 hour"
    },
    {
      id: 2,
      name: "Emma Rodriguez",
      rating: 4.7,
      experience: "Engineering Student",
      price: 20,
      message: "I recently completed advanced calculus and remember struggling with the same concepts. I can explain them in simple terms!",
      responseTime: "Usually responds within 30 minutes"
    },
    {
      id: 3,
      name: "James Wilson",
      rating: 4.6,
      experience: "Teaching Assistant",
      price: 30,
      message: "I'm a TA for Calc 1 and 2. I have office hours materials that might help, and I'm very familiar with common problem areas.",
      responseTime: "Usually responds within 2 hours"
    }
  ];

  const handleApply = () => {
    setIsApplied(true);
    toast.success("Application submitted successfully!");
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Academic Help": return BookOpen;
      case "Food & Delivery": return Coffee;
      case "Tech Support": return Laptop;
      case "Moving & Logistics": return Package;
      case "Transportation": return Car;
      default: return BookOpen;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const CategoryIcon = getCategoryIcon(task.category);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Header */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <CategoryIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-gray-800">{task.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{task.category}</Badge>
                      <Badge className={getUrgencyColor(task.urgency)}>
                        {task.urgency}
                      </Badge>
                      <Badge variant="outline" className="text-green-600">
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Task Description */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-gray-800">Task Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </CardContent>
          </Card>

          {/* Requirements */}
          {task.requirements.length > 0 && (
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {task.requirements.map((req, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Applicants */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-gray-800">Applicants ({applicants.length})</CardTitle>
              <CardDescription>Students who have applied for this task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {applicants.map((applicant) => (
                <div key={applicant.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>{applicant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-gray-800">{applicant.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{applicant.rating}</span>
                          <span>•</span>
                          <span>{applicant.experience}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-800">₵{applicant.price}</div>
                      <div className="text-sm text-gray-500">{applicant.responseTime}</div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{applicant.message}</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price & Apply */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 mb-2">₵{task.price}</div>
                <div className="text-sm text-gray-500">Budget for this task</div>
              </div>
            </CardHeader>
            <CardContent>
              {!isApplied ? (
                <Button onClick={handleApply} className="w-full" size="lg">
                  Apply for Task
                </Button>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="font-medium text-green-600 mb-2">Application Sent!</p>
                  <p className="text-sm text-gray-600">The task poster will review your application and get back to you.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Task Details */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-gray-800">Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-800">Location</div>
                  <div className="text-sm text-gray-600">{task.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-800">Deadline</div>
                  <div className="text-sm text-gray-600">{task.deadline}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-800">Applicants</div>
                  <div className="text-sm text-gray-600">{task.applicants} students applied</div>
                </div>
              </div>
              {task.isFlexible && (
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="font-medium text-gray-800">Flexible Timing</div>
                    <div className="text-sm text-gray-600">Open to timing adjustments</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Task Poster */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-gray-800">Task Posted By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={task.requester.avatar} />
                  <AvatarFallback>{task.requester.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-gray-800">{task.requester.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{task.requester.rating}</span>
                    <span>•</span>
                    <span>{task.requester.tasksCompleted} tasks</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Member since {task.requester.joinDate}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Profile
                </Button>
                <Button size="sm" className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Safety Tips */}
          <Card className="border-0 shadow-sm bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Safety Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li>• Meet in public campus locations</li>
                <li>• Verify student identity</li>
                <li>• Use in-app messaging</li>
                <li>• Report suspicious activity</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
