import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  Library, 
  FileText, 
  Users, 
  BarChart3, 
  Menu,
  Plus,
  Layout,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Question Library", href: "/library", icon: Library },
  { name: "Headers", href: "/headers", icon: Layout },
  { name: "Footers", href: "/footers", icon: Hash },
  { name: "Questionnaires", href: "/questionnaires", icon: FileText },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary">FormCraft</h1>
        <p className="text-sm text-muted-foreground">Dynamic Questionnaires</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Questionnaire
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-card border-r border-border">
          <SidebarContent />
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}