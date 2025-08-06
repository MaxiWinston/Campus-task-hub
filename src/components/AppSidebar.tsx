import { 
  Home, 
  List, 
  Plus, 
  MessageSquare, 
  User, 
  Settings, 
  Shield,
  BookOpen,
  Coffee,
  Laptop,
  Package,
  Car,
  Bell
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { NotificationBell } from "./NotificationBell";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  showCategories?: boolean;
}

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home, color: "text-blue-500" },
  { title: "Browse Tasks", url: "/tasks", icon: List, color: "text-blue-500" },
  { title: "Create Task", url: "/tasks/create", icon: Plus, color: "text-blue-500" },
  { title: "Messages", url: "/chat", icon: MessageSquare, color: "text-blue-500" },
  { title: "My Profile", url: "/profile", icon: User, color: "text-blue-500" },
];

const categories = [
  { 
    title: "Academic Help", 
    id: "academic",
    icon: BookOpen, 
    color: "text-blue-500" 
  },
  { 
    title: "Food & Delivery", 
    id: "food",
    icon: Coffee, 
    color: "text-orange-500" 
  },
  { 
    title: "Tech Support", 
    id: "tech",
    icon: Laptop, 
    color: "text-purple-500" 
  },
  { 
    title: "Moving & Logistics", 
    id: "moving",
    icon: Package, 
    color: "text-green-500" 
  },
  { 
    title: "Transportation", 
    id: "transportation",
    icon: Car, 
    color: "text-red-500" 
  },
];

export function AppSidebar({ showCategories = false }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const handleCategoryClick = (categoryId: string) => {
    // Navigate to tasks page with category filter
    navigate(`/tasks?category=${categoryId}`);
    
    // Optional: You can also add a small delay to ensure smooth transition
    setTimeout(() => {
      // Force a page reload to trigger the category filter
      // This is a workaround since we're using client-side routing
      window.location.reload();
    }, 100);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground shadow-glow" : "hover:bg-sidebar-accent";

  return (
    <Sidebar className="w-64 shadow-medium bg-white" collapsible="offcanvas">
      <SidebarContent className="border-r border-gray-200">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-glow">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Campus TaskHub</h1>
              <p className="text-xs text-gray-500">Student Marketplace</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        `flex items-center gap-3 p-3 text-sm font-medium rounded-md transition-colors ${
                          isActive 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Add Notifications Menu Item */}
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="w-full">
                      <div className="flex items-center gap-3 w-full">
                        <div className="relative">
                          <Bell className="h-4 w-4" />
                        </div>
                        <span>Notifications</span>
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 p-0" align="start" side="right" sideOffset={10}>
                    <NotificationBell />
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Categories - Only show when showCategories is true */}
        {showCategories && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-500 font-medium">Categories</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {categories.map((category) => (
                  <SidebarMenuItem key={category.title}>
                    <SidebarMenuButton asChild>
                      <button
                        onClick={() => handleCategoryClick(category.id)}
                        className={`flex items-center gap-3 p-3 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100 w-full text-left`}
                      >
                        <category.icon className={`h-5 w-5 ${category.color}`} />
                        <span>{category.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        
        {/* Admin Link */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/admin" 
                      className={({ isActive }) => 
                        `flex items-center gap-3 p-3 text-sm font-medium rounded-md transition-colors ${
                          isActive 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`
                      }
                    >
                      <Shield className="h-5 w-5" />
                      <span>Admin Panel</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
