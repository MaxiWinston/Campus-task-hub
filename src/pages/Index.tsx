
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Users, 
  Star, 
  BookOpen, 
  Coffee, 
  Laptop, 
  Package, 
  Car, 
  Shield,
  Clock,
  DollarSign,
  Heart
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
        <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-glow">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Campus TaskHub</h1>
              <p className="text-sm text-muted-foreground">Student Marketplace</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="border-primary/20 hover:border-primary hover:bg-primary/5" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button className="bg-primary hover:bg-primary/90 hover:shadow-glow transition-all duration-300" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Too Busy to Do <span className="text-primary">Everything</span>?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Finals got you swamped? Need someone to grab your textbooks or walk your dog? Find students nearby who can help - or make some quick cash helping others!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 hover:shadow-glow transition-all duration-300 animate-scale-in" asChild>
              <Link to="/signup" className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Get Started
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary/20 hover:border-primary hover:bg-primary/5 animate-scale-in" asChild>
              <Link to="/login" className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12 text-foreground">It's Pretty Simple</h3>
        <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center bg-card shadow-medium hover:shadow-large transition-all duration-300 border-border/50 animate-fade-in group">
            <CardHeader>
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-float">
                <Search className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-primary">Find What You Need</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">
                Scroll through real requests from students on your campus. Need groceries picked up? Homework help? Someone to wait for your package? It's all here.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center bg-card shadow-medium hover:shadow-large transition-all duration-300 border-border/50 animate-fade-in group">
            <CardHeader>
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-float">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-primary">Chat & Coordinate</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">
                Message each other directly to work out the details. "Can you grab extra ranch?" "Meet by the library?" "My dorm is the tall brick one." You know how it goes.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center bg-card shadow-medium hover:shadow-large transition-all duration-300 border-border/50 animate-fade-in group">
            <CardHeader>
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-float">
                <Heart className="h-8 w-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-accent">Get It Done</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">
                Task gets done, money changes hands, everyone's happy. Leave a quick rating so others know who's reliable (and who definitely isn't).
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16 bg-white/50 rounded-3xl mx-4 mb-16">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">What Students Actually Need Help With</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { name: "Academic Help", icon: BookOpen, color: "from-blue-500 to-blue-600", tasks: "156 tasks" },
            { name: "Food & Delivery", icon: Coffee, color: "from-orange-500 to-orange-600", tasks: "89 tasks" },
            { name: "Tech Support", icon: Laptop, color: "from-purple-500 to-purple-600", tasks: "72 tasks" },
            { name: "Moving & Logistics", icon: Package, color: "from-green-500 to-green-600", tasks: "43 tasks" },
            { name: "Transportation", icon: Car, color: "from-red-500 to-red-600", tasks: "61 tasks" },
          ].map((category) => (
            <Card key={category.name} className="hover:shadow-lg transition-shadow cursor-pointer border-gray-100">
              <CardHeader className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <category.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-sm font-medium text-gray-800">{category.name}</CardTitle>
                <CardDescription className="text-xs text-gray-500">{category.tasks}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">2,400+</div>
            <div className="text-gray-600">Students Using This</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-600 mb-2">15,000+</div>
            <div className="text-gray-600">Problems Solved</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-600 mb-2">4.8/5</div>
            <div className="text-gray-600">Stars (Not Bad!)</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="bg-primary text-primary-foreground border-0 shadow-large">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-4">Ready to Stop Stressing?</CardTitle>
            <CardDescription className="text-primary-foreground/80 text-lg mb-6">
              Join the thousands of students who've figured out that asking for help isn't giving up - it's being smart.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-card text-foreground hover:bg-card/90" asChild>
                <Link to="/signup">Join Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold">Campus TaskHub</h4>
                <p className="text-sm text-gray-400">Making college life a little less chaotic</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Shield className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-400">Secure & Trusted Platform</span>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Campus TaskHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
