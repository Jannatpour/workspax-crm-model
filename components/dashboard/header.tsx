'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Bell,
  BellDot,
  Search,
  Bot,
  Mail,
  Menu,
  Sun,
  Moon,
  HelpCircle,
  User,
  Settings,
  LogOut,
  Users,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
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
import { User as UserType } from '@/context/auth-context';

interface DashboardHeaderProps {
  user: UserType;
  children?: React.ReactNode;
}

export function DashboardHeader({ user, children }: DashboardHeaderProps) {
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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      {/* Mobile Menu */}
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
      </div>

      <div className="flex flex-1 items-center gap-4">
        {/* Brand/Logo */}
        <Button
          variant="ghost"
          className="flex items-center gap-2 font-semibold"
          onClick={() => changeSection('overview')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
            <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
            <circle cx="12" cy="12" r="1.5" />
            <path d="M16.2 16.2c2.3-2.3 2.3-6.1 0-8.5" />
            <path d="M19.1 19.1C23 15.2 23 8.8 19.1 4.9" />
          </svg>
          <span className="hidden sm:inline">WorkspaxCRM</span>
        </Button>

        {/* Workspace Selector & Section Title */}
        <div className="flex items-center gap-4">
          {children}
          <h1 className="text-xl font-semibold hidden md:block">{getSectionDisplayName()}</h1>
        </div>

        {/* Search - Hidden on small devices */}
        <div className="relative flex-1 max-w-sm hidden md:flex">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="pl-8 bg-muted border-none" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick access buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => changeSection('mail-inbox')}
        >
          <Mail className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
            3
          </Badge>
        </Button>

        <Button variant="ghost" size="icon" onClick={() => changeSection('contacts')}>
          <Users className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={() => changeSection('agents')}>
          <Bot className="h-4 w-4" />
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <Button variant="ghost" size="icon" className="relative">
          <BellDot className="h-5 w-5" />
          <span className="absolute top-1 right-1 flex h-2 w-2 animate-pulse rounded-full bg-primary"></span>
        </Button>

        {/* Help Button */}
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>

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
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem disabled>{user?.name || user?.email}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeSection('settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
