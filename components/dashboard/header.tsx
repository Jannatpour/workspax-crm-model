'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Search,
  Bot,
  Mail,
  Menu,
  Sun,
  Moon,
  LifeBuoy,
  User,
  Settings,
  LogOut,
  Users,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { useSidebarStore } from '@/hooks/use-sidebar';
import { useDashboard } from '@/context/dashboard-context';

interface DashboardHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const { logout } = useAuth();
  const { collapsed, toggleCollapsed } = useSidebarStore();
  const { changeSection, currentSection } = useDashboard();
  const [isMounted, setIsMounted] = useState(false);

  // Mount effect for hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get the current section display name
  const getSectionDisplayName = () => {
    // Convert section ID to display name
    if (!currentSection) return 'Dashboard';

    // Handle special case sections
    if (currentSection.startsWith('mail-')) {
      const mailSection = currentSection.replace('mail-', '');
      return `Mail - ${mailSection.charAt(0).toUpperCase() + mailSection.slice(1)}`;
    }

    if (currentSection.startsWith('agents-')) {
      const agentSection = currentSection.replace('agents-', '');
      return `AI Agents - ${agentSection.charAt(0).toUpperCase() + agentSection.slice(1)}`;
    }

    if (currentSection.startsWith('contacts-')) {
      const contactsSection = currentSection.replace('contacts-', '');
      return `Contacts - ${contactsSection.charAt(0).toUpperCase() + contactsSection.slice(1)}`;
    }

    if (currentSection.startsWith('settings-')) {
      const settingsSection = currentSection.replace('settings-', '');
      return `Settings - ${settingsSection.charAt(0).toUpperCase() + settingsSection.slice(1)}`;
    }

    // Default formatting
    return currentSection.charAt(0).toUpperCase() + currentSection.slice(1);
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.name) return 'U';

    const nameParts = user.name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`;
    }
    return nameParts[0][0];
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar />
          </SheetContent>
        </Sheet>

        <Button
          variant="ghost"
          className="flex items-center"
          onClick={() => changeSection('overview')}
        >
          <span className="font-bold">WorkspaxCRM</span>
        </Button>
      </div>

      <div className="hidden md:flex md:flex-1 md:gap-4">
        {/* Dynamic section title based on current section */}
        <h1 className="text-xl font-semibold">{getSectionDisplayName()}</h1>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="pl-8 bg-muted border-none" />
        </div>
      </div>

      <div className="flex items-center gap-2 md:ml-auto md:gap-4">
        {/* Quick access buttons */}
        <Button
          variant="outline"
          size="icon"
          className="relative"
          onClick={() => changeSection('mail-inbox')}
        >
          <Mail className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
            3
          </Badge>
        </Button>

        <Button variant="outline" size="icon" onClick={() => changeSection('contacts')}>
          <Users className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="icon" onClick={() => changeSection('agents')}>
          <Bot className="h-4 w-4" />
        </Button>

        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Desktop sidebar toggle button - only show if mounted to avoid hydration issues */}
        {isMounted && (
          <Button
            variant="outline"
            size="icon"
            onClick={toggleCollapsed}
            className="hidden lg:flex"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => changeSection('settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
