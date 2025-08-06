import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign,
  BookOpen,
  Coffee,
  Laptop,
  Package,
  Car,
  User
} from "lucide-react";
import { Link } from "react-router-dom";

interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  timePosted: string;
  deadline: string;
  requester: {
    name: string;
    rating: number;
    tasksCompleted: number;
  };
  urgency: string;
  applicants: number;
}

const TaskListing = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Help with Calculus Assignment",
      description: "Need help understanding derivatives and integrals for my calculus homework. Looking for someone who can explain concepts clearly.",
      category: "Academic Help",
      price: 25,
      location: "North Campus Library",
      timePosted: "2 hours ago",
      deadline: "Tomorrow 11:59 PM",
      requester: {
        name: "Sarah M.",
        rating: 4.8,
        tasksCompleted: 15
      },
      urgency: "Medium",
      applicants: 3
    },
    {
      id: 2,
      title: "Food Delivery from Campus Store",
      description: "Can someone pick up groceries from the campus store? I'll provide the list and payment. Just need it delivered to my dorm.",
      category: "Food & Delivery",
      price: 8,
      location: "East Residence Hall",
      timePosted: "30 minutes ago",
      deadline: "Today 6:00 PM",
      requester: {
        name: "Mike R.",
        rating: 4.9,
        tasksCompleted: 32
      },
      urgency: "High",
      applicants: 7
    },
    {
      id: 3,
      title: "Laptop Won't Connect to WiFi",
      description: "My laptop suddenly stopped connecting to the campus WiFi. All other devices work fine. Need someone tech-savvy to help diagnose the issue.",
      category: "Tech Support",
      price: 20,
      location: "Student Union",
      timePosted: "1 hour ago",
      deadline: "Today 8:00 PM",
      requester: {
        name: "Emma K.",
        rating: 4.7,
        tasksCompleted: 8
      },
      urgency: "High",
      applicants: 2
    },
    {
      id: 4,
      title: "Moving Help - Dorm to Apartment",
      description: "Moving out of my dorm and need help carrying boxes and furniture to my new apartment. Have a car but need extra hands.",
      category: "Moving & Logistics",
      price: 45,
      location: "West Campus",
      timePosted: "4 hours ago",
      deadline: "This Weekend",
      requester: {
        name: "Alex K.",
        rating: 4.6,
        tasksCompleted: 12
      },
      urgency: "Medium",
      applicants: 5
    },
    {
      id: 5,
      title: "Ride to Airport",
      description: "Need a ride to the airport for my flight home. Can split gas cost. Flight is early morning so need someone reliable.",
      category: "Transportation",
      price: 30,
      location: "Campus Center",
      timePosted: "6 hours ago",
      deadline: "Friday 5:00 AM",
      requester: {
        name: "Jessica L.",
        rating: 4.9,
        tasksCompleted: 24
      },
      urgency: "Medium",
      applicants: 4
    },
    {
      id: 6,
      title: "Chemistry Lab Report Review",
      description: "Looking for someone to review my chemistry lab report before submission. Need feedback on methodology and conclusions.",
      category: "Academic Help",
      price: 15,
      location: "Science Building",
      timePosted: "3 hours ago",
      deadline: "Thursday 2:00 PM",
      requester: {
        name: "David P.",
        rating: 4.5,
        tasksCompleted: 6
      },
      urgency: "Low",
      applicants: 1
    }
  ]);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  const categories = [
    { id: "all", name: "All Categories", icon: Filter },
    { id: "academic", name: "Academic Help", icon: BookOpen },
    { id: "food", name: "Food & Delivery", icon: Coffee },
    { id: "tech", name: "Tech Support", icon: Laptop },
    { id: "moving", name: "Moving & Logistics", icon: Package },
    { id: "transport", name: "Transportation", icon: Car },
  ];

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = searchQuery === "" || 
                         task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Map between URL category IDs and task categories
      const categoryMap: Record<string, string> = {
        'academic': 'Academic Help',
        'food': 'Food & Delivery',
        'tech': 'Tech Support',
        'moving': 'Moving & Logistics',
        'transportation': 'Transportation',
        'transport': 'Transportation' // Handle both 'transport' and 'transportation' for backward compatibility
      };
      
      const matchesCategory = !selectedCategory || 
                           selectedCategory === 'all' ||
                           task.category.toLowerCase() === categoryMap[selectedCategory]?.toLowerCase() ||
                           task.category.toLowerCase() === selectedCategory.toLowerCase();
      
      const matchesPrice = () => {
        if (priceRange === 'all') return true;
        if (priceRange === 'low') return task.price < 20;
        if (priceRange === 'medium') return task.price >= 20 && task.price <= 40;
        if (priceRange === 'high') return task.price > 40;
        return true;
      };

      return matchesSearch && matchesCategory && matchesPrice();
    });
  }, [tasks, searchQuery, selectedCategory, priceRange]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Browse Tasks</h1>
        <p className="text-gray-600">Find tasks that match your skills and schedule</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-64">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Price range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="low">Under ₵20</SelectItem>
              <SelectItem value="medium">₵20 - ₵40</SelectItem>
              <SelectItem value="high">₵40+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {category.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </p>
      </div>

      {/* Task Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {filteredTasks.map(task => {
          const CategoryIcon = getCategoryIcon(task.category);
          return (
            <Card key={task.id} className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                      <CategoryIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-800">{task.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{task.category}</Badge>
                        <Badge className={`text-xs ${getUrgencyColor(task.urgency)}`}>
                          {task.urgency}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">₵{task.price}</div>
                    <div className="text-sm text-gray-500">{task.applicants} applicants</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-gray-600 line-clamp-3">
                  {task.description}
                </CardDescription>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{task.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{task.timePosted}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-white" />
                    </div>
                    <span className="font-medium">{task.requester.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{task.requester.rating}</span>
                    </div>
                    <span className="text-gray-500">({task.requester.tasksCompleted} tasks)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    Deadline: {task.deadline}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/tasks/${task.id}`}>View Details</Link>
                    </Button>
                    <Button size="sm">Apply Now</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Load More */}
      {filteredTasks.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Tasks
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No tasks found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
          <Button asChild>
            <Link to="/tasks/create">Create a New Task</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskListing;
