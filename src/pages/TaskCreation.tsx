
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Coffee, 
  Laptop, 
  Package, 
  Car, 
  MapPin, 
  Clock, 
  DollarSign,
  AlertCircle,
  Plus,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TaskCreation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    location: "",
    deadline: "",
    urgency: "Medium",
    requirements: [] as string[],
    isFlexible: false,
    contactMethod: "chat"
  });

  const [newRequirement, setNewRequirement] = useState("");

  const categories = [
    { id: "academic", name: "Academic Help", icon: BookOpen, color: "from-blue-500 to-blue-600" },
    { id: "food", name: "Food & Delivery", icon: Coffee, color: "from-orange-500 to-orange-600" },
    { id: "tech", name: "Tech Support", icon: Laptop, color: "from-purple-500 to-purple-600" },
    { id: "moving", name: "Moving & Logistics", icon: Package, color: "from-green-500 to-green-600" },
    { id: "transport", name: "Transportation", icon: Car, color: "from-red-500 to-red-600" },
  ];

  const urgencyLevels = [
    { value: "Low", description: "Can wait a few days", color: "text-green-600" },
    { value: "Medium", description: "Within 1-2 days", color: "text-yellow-600" },
    { value: "High", description: "ASAP - Today/Tomorrow", color: "text-red-600" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.description || !formData.category || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Simulate task creation
    toast.success("Task created successfully!");
    console.log("Creating task with data:", formData);
    
    // Navigate to task listing
    navigate("/tasks");
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Task</h1>
        <p className="text-gray-600">Post a task and connect with fellow students who can help</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Basic Information</CardTitle>
                <CardDescription>Tell us about your task</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Help with Chemistry Lab Report"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about what you need help with..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label>Category *</Label>
                  <div className="grid sm:grid-cols-2 gap-3 mt-2">
                    {categories.map(category => {
                      const Icon = category.icon;
                      return (
                        <div
                          key={category.id}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.category === category.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-medium">{category.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location and Timing */}
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Location & Timing</CardTitle>
                <CardDescription>When and where do you need help?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        placeholder="e.g., North Campus Library"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="pl-10 mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="deadline"
                        type="datetime-local"
                        value={formData.deadline}
                        onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                        className="pl-10 mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Urgency Level</Label>
                  <RadioGroup 
                    value={formData.urgency} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}
                    className="mt-2"
                  >
                    {urgencyLevels.map(level => (
                      <div key={level.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={level.value} id={level.value} />
                        <Label htmlFor={level.value} className="flex items-center gap-2 cursor-pointer">
                          <span className={`font-medium ${level.color}`}>{level.value}</span>
                          <span className="text-gray-500 text-sm">{level.description}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="flexible"
                    checked={formData.isFlexible}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFlexible: checked as boolean }))}
                  />
                  <Label htmlFor="flexible" className="text-sm">
                    I'm flexible with timing
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Requirements</CardTitle>
                <CardDescription>What skills or qualifications do you need?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Chemistry knowledge, own car, etc."
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  />
                  <Button type="button" onClick={addRequirement} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.requirements.map((req, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {req}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-red-100"
                          onClick={() => removeRequirement(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Pricing</CardTitle>
                <CardDescription>How much are you willing to pay?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="price">Amount ($) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="price"
                      type="number"
                      placeholder="25"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="pl-10 mt-1"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Pricing Tips</p>
                      <ul className="text-xs text-blue-700 mt-1 space-y-1">
                        <li>• Check similar tasks for fair pricing</li>
                        <li>• Consider complexity and time required</li>
                        <li>• Higher prices attract more applicants</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Preferences */}
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Contact Method</CardTitle>
                <CardDescription>How should people reach you?</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={formData.contactMethod} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, contactMethod: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="chat" id="chat" />
                    <Label htmlFor="chat">In-app chat (recommended)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="phone" />
                    <Label htmlFor="phone">Phone</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-500 to-green-500">
              <CardContent className="p-6">
                <Button 
                  type="submit" 
                  className="w-full bg-white text-blue-600 hover:bg-gray-50"
                  size="lg"
                >
                  Post Task
                </Button>
                <p className="text-center text-blue-100 text-sm mt-2">
                  Your task will be visible to all students
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskCreation;
