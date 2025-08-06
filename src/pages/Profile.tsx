import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  MapPin,
  Edit,
  BookOpen,
  Coffee,
  Laptop,
  Package,
  Camera,
  X,
  Check,
  Loader2,
  Image
} from "lucide-react";

const Profile = () => {
  const { id } = useParams();
  const isOwnProfile = !id;
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [headerImage, setHeaderImage] = useState("/default-header.jpg");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    id: "1",
    name: "Jessica Chen",
    avatar: "/placeholder.svg",
    rating: 4.9,
    reviewCount: 47,
    tasksCompleted: 52,
    joinDate: "September 2023",
    location: "North Campus",
    bio: "Computer Science major with a passion for helping fellow students. I specialize in tech support, academic tutoring, and campus logistics. Always happy to lend a hand!",
    skills: ["Programming", "Math Tutoring", "Tech Support", "Writing", "Research"],
    stats: {
      totalEarnings: 108,
    }
  });

  const [editForm, setEditForm] = useState({
    name: "",
    location: "",
    bio: "",
    skills: ""
  });

  useEffect(() => {
    setEditForm({
      name: profile.name,
      location: profile.location,
      bio: profile.bio,
      skills: profile.skills.join(", ")
    });
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setProfile(prev => ({
      ...prev,
      name: editForm.name,
      location: editForm.location,
      bio: editForm.bio,
      skills: editForm.skills.split(",").map(skill => skill.trim())
    }));
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    if (isOwnProfile && fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) return alert('Please upload a valid image file (JPEG, PNG, GIF)');
    if (file.size > maxSize) return alert('Image size should be less than 5MB');

    try {
      setIsUploading(true);
      const imageUrl = URL.createObjectURL(file);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfile(prev => ({ ...prev, avatar: imageUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleHeaderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) return alert('Please upload a valid image file (JPEG, PNG, GIF)');
    if (file.size > maxSize) return alert('Image size should be less than 5MB');

    try {
      const imageUrl = URL.createObjectURL(file);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHeaderImage(imageUrl);
    } catch (error) {
      console.error('Error uploading header image:', error);
      alert('Error uploading header image. Please try again.');
    }
  };

  const renderStars = (rating: number) => (
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ))
  );

  const newLocal = (
    <div className="text-2xl font-bold text-orange-600">
      ₵{profile.stats.totalEarnings.toLocaleString()}
    </div>
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <div className="relative">
          <div className="h-32 bg-cover bg-center cursor-pointer" style={{ backgroundImage: `url(${headerImage})` }} onClick={() => headerInputRef.current?.click()}>
            <input
              type="file"
              ref={headerInputRef}
              onChange={handleHeaderChange}
              accept="image/*"
              className="hidden"
            />
            {isOwnProfile && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 p-1 rounded-full">
                <Image className="h-5 w-5 text-white" />
              </div>
            )}
          </div>

          <div className="px-6 pb-6 -mt-16 relative">
            <div className="flex items-end gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-lg">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <button 
                    onClick={handleAvatarClick}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg shadow-sm">
                    <Input
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      className="text-xl font-bold bg-transparent"
                    />
                    <Input
                      name="location"
                      value={editForm.location}
                      onChange={handleInputChange}
                      className="text-sm text-gray-600 bg-transparent"
                    />
                  </div>
                ) : (
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg shadow-sm inline-block">
                    <h1 className="text-2xl font-bold">{profile.name}</h1>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-1 mt-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{profile.rating.toFixed(1)}</span>
                  <span className="text-gray-500 text-sm">({profile.reviewCount} reviews)</span>
                </div>
              </div>
              
              {isOwnProfile && (
                <div className="mb-2">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveProfile}>
                        <Check className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit Profile
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label>Bio</label>
                    <Textarea
                      name="bio"
                      value={editForm.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label>Skills (comma separated)</label>
                    <Input
                      name="skills"
                      value={editForm.skills}
                      onChange={handleInputChange}
                      className="mt-1"
                      placeholder="e.g., Programming, Design, Writing"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-700">{profile.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Tabs defaultValue="overview" className="mt-8">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="tasks">Completed Tasks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold">{profile.tasksCompleted}</div>
                      <p className="text-sm text-gray-500">Tasks Completed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold">{profile.rating.toFixed(1)}</div>
                      <p className="text-sm text-gray-500">Average Rating</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        ₵{profile.stats.totalEarnings.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-500">Total Earned</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <p className="text-gray-500 text-center py-8">No reviews yet.</p>
              </TabsContent>
              
              <TabsContent value="tasks" className="mt-6">
                <p className="text-gray-500 text-center py-8">No completed tasks yet.</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
