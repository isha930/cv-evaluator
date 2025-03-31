
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload, BarChart2, FileText, Home, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Toggle } from "@/components/ui/toggle";

const Navigation = () => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg transition-all">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <BarChart2 className="h-6 w-6 text-primary" />
          <span className="text-lg font-medium">ResumeRank</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          {[
            { path: "/", label: "Home", icon: <Home className="h-4 w-4 mr-1" /> },
            { path: "/upload", label: "Upload", icon: <Upload className="h-4 w-4 mr-1" /> },
            { path: "/ranking", label: "Ranking", icon: <BarChart2 className="h-4 w-4 mr-1" /> },
            { path: "/reports", label: "Reports", icon: <FileText className="h-4 w-4 mr-1" /> },
          ].map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "relative flex items-center text-sm font-medium transition-colors hover:text-primary",
                isActive(path) 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              {icon}
              {label}
              {isActive(path) && (
                <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-primary" />
              )}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center space-x-4">
          <Toggle 
            aria-label="Toggle theme" 
            pressed={theme === "dark"} 
            onPressedChange={toggleTheme}
            className="mr-2"
          >
            {theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Toggle>
          
          <div className="md:hidden">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <Home className={cn("h-5 w-5", isActive("/") ? "text-primary" : "text-muted-foreground")} />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/upload">
                <Upload className={cn("h-5 w-5", isActive("/upload") ? "text-primary" : "text-muted-foreground")} />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/ranking">
                <BarChart2 className={cn("h-5 w-5", isActive("/ranking") ? "text-primary" : "text-muted-foreground")} />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/reports">
                <FileText className={cn("h-5 w-5", isActive("/reports") ? "text-primary" : "text-muted-foreground")} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
