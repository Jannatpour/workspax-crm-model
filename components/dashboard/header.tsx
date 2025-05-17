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
  HelpCircle,
  User,
  Settings,
  LogOut,
  Users,
  FileText,
  PenSquare,
  ChevronDown,
  Home,
  PlusCircle,
  BarChart3,
  Calendar,
  X,
  Zap,
  CheckCircle,
  Flag,
  MessageSquare,
  Inbox,
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(3); // Simulated unread count

  // Mount effect for hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle search clear
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Get the current section display name with improved formatting
  const getSectionDisplayName = () => {
    // Convert section ID to display name
    if (!currentSection) return 'Dashboard';

    // Handle special case sections
    if (currentSection.startsWith('mail-')) {
      const mailSection = currentSection.replace('mail-', '');
      const formattedSection = mailSection.charAt(0).toUpperCase() + mailSection.slice(1);

      switch (mailSection) {
        case 'inbox':
          return 'Mail · Inbox';
        case 'compose':
          return 'Mail · Compose New';
        case 'sent':
          return 'Mail · Sent Items';
        case 'drafts':
          return 'Mail · Drafts';
        case 'important':
          return 'Mail · Important';
        case 'trash':
          return 'Mail · Trash';
        default:
          return `Mail · ${formattedSection}`;
      }
    }

    if (currentSection.startsWith('agents-')) {
      const agentSection = currentSection.replace('agents-', '');
      return `AI Agents · ${agentSection.charAt(0).toUpperCase() + agentSection.slice(1)}`;
    }

    if (currentSection.startsWith('contacts-')) {
      const contactsSection = currentSection.replace('contacts-', '');
      return `Contacts · ${contactsSection.charAt(0).toUpperCase() + contactsSection.slice(1)}`;
    }

    if (currentSection.startsWith('settings-')) {
      const settingsSection = currentSection.replace('settings-', '');
      return `Settings · ${settingsSection.charAt(0).toUpperCase() + settingsSection.slice(1)}`;
    }

    if (currentSection.startsWith('templates-')) {
      const templatesSection = currentSection.replace('templates-', '');
      return `Templates · ${templatesSection.charAt(0).toUpperCase() + templatesSection.slice(1)}`;
    }

    // Special cases
    if (currentSection === 'overview') return 'Dashboard';

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

  // Navigate to section
  const navigateTo = (section: string, params?: Record<string, any>) => {
    changeSection(section as any, params);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 backdrop-blur-sm bg-background/90 transition-all duration-200">
      {/* Mobile Menu */}
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden h-9 w-9 rounded-full"
              aria-label="Open main menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80 sm:max-w-sm">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-1 items-center gap-4">
        {/* Brand/Logo - with animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            className="flex items-center gap-2 font-semibold rounded-full px-3 hover:bg-primary/10"
            onClick={() => navigateTo('overview')}
            aria-label="Go to dashboard"
          >
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
                <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
                <circle cx="12" cy="12" r="1.5" />
                <path d="M16.2 16.2c2.3-2.3 2.3-6.1 0-8.5" />
                <path d="M19.1 19.1C23 15.2 23 8.8 19.1 4.9" />
              </svg>
            </motion.div>
            <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-400">
              WorkSpaxCRM
            </span>
          </Button>
        </motion.div>

        {/* Workspace Selector & Section Title */}
        <div className="flex items-center gap-4">
          {children}
          <motion.h1
            className="text-lg font-semibold hidden md:block"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {getSectionDisplayName()}
          </motion.h1>
        </div>

        {/* Search - Hidden on small devices */}
        <AnimatePresence>
          {showSearchBar ? (
            <motion.div
              className="relative flex-1 max-w-md mx-auto flex"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                type="search"
                placeholder="Search emails, contacts, tasks..."
                className="pl-10 pr-10 py-2 bg-muted/60 border-none rounded-full focus:ring-2 focus:ring-primary/30 w-full"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="relative flex-1 max-w-sm hidden md:flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => setShowSearchBar(true)}
                aria-label="Open search"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Compose Button - prominently display in header */}
        {/* <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="gap-2 hidden sm:flex"
                onClick={() => navigateTo('mail-compose')}
                data-testid="header-compose-button"
                aria-label="Compose new email"
              >
                <PenSquare className="h-4 w-4" />
                <span>Compose</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Compose new email</TooltipContent>
          </Tooltip>
        </TooltipProvider> */}

        {/* Quick access buttons with tooltips */}
        <nav className="flex items-center">
          {/* Mail Dropdown */}
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'h-9 w-9 rounded-full relative transition-colors',
                          currentSection?.startsWith('mail-') && 'bg-primary/10 text-primary'
                        )}
                        data-testid="header-mail-button"
                      >
                        <Mail className="h-4 w-4" />
                        {unreadCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] animate-in zoom-in-50">
                            {unreadCount}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 backdrop-blur-sm">
                      <DropdownMenuLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigateTo('mail-compose')}
                      >
                        <PenSquare className="h-4 w-4" />
                        <span>Compose New</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigateTo('mail-inbox')}
                      >
                        <Inbox className="h-4 w-4" />
                        <span>Inbox</span>
                        {unreadCount > 0 && (
                          <Badge className="ml-auto" variant="secondary">
                            {unreadCount} new
                          </Badge>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigateTo('mail-sent')}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Sent</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigateTo('mail-drafts')}
                      >
                        <FileText className="h-4 w-4" />
                        <span>Drafts</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TooltipTrigger>
              <TooltipContent>Mail</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Contacts */}
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-9 w-9 rounded-full transition-colors',
                    currentSection?.startsWith('contacts') && 'bg-primary/10 text-primary'
                  )}
                  onClick={() => navigateTo('contacts')}
                  data-testid="header-contacts-button"
                  aria-label="Contacts"
                >
                  <Users className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Contacts</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* AI Agents */}
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-9 w-9 rounded-full transition-colors',
                    currentSection?.startsWith('agents') && 'bg-primary/10 text-primary'
                  )}
                  onClick={() => navigateTo('agents')}
                  data-testid="header-agents-button"
                  aria-label="AI Agents"
                >
                  <Bot className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>AI Agents</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Templates */}
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-9 w-9 rounded-full transition-colors',
                    currentSection?.startsWith('templates') && 'bg-primary/10 text-primary'
                  )}
                  onClick={() => navigateTo('templates')}
                  data-testid="header-templates-button"
                  aria-label="Templates"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Templates</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Theme Toggle with tooltip */}
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center h-9 w-9">
                  <ThemeToggle />
                </div>
              </TooltipTrigger>
              <TooltipContent>Toggle theme</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Notification Bell */}
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-9 w-9 rounded-full relative transition-colors',
                    currentSection?.startsWith('notifications') && 'bg-primary/10 text-primary'
                  )}
                  onClick={() => navigateTo('notifications')}
                  data-testid="header-notifications-button"
                  aria-label="Notifications"
                >
                  <BellDot className="h-4 w-4" />
                  <span className="absolute top-2 right-2 flex h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Help Button with external link */}
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => window.open('https://docs.workspaxcrm.com', '_blank')}
                  data-testid="header-help-button"
                  aria-label="Help"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Help & Support</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Create Menu - Quick Actions */}
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Create new...</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Create New</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigateTo('mail-compose')}>
                <Mail className="mr-2 h-4 w-4" />
                <span>Email</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateTo('leads', { action: 'create' })}>
                <User className="mr-2 h-4 w-4" />
                <span>Lead</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateTo('templates-email', { action: 'create' })}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Template</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigateTo('agents-create')}>
                <Bot className="mr-2 h-4 w-4" />
                <span>AI Agent</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop sidebar toggle button - only show if mounted to avoid hydration issues */}
          {isMounted && (
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleCollapsed}
                    className="hidden lg:flex h-9 w-9 rounded-full ml-1"
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{collapsed ? 'Expand sidebar' : 'Collapse sidebar'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </nav>

        {/* User menu - enhanced */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 ml-0.5 p-0 overflow-hidden ring-2 ring-primary/10 hover:ring-primary/30 transition-all"
            >
              <Avatar className="h-full w-full">
                <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="rounded-full overflow-hidden w-10 h-10">
                <Avatar className="h-full w-full">
                  <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium line-clamp-1">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{user?.email || ''}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigateTo('settings-profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateTo('mail-inbox')}>
                <Mail className="mr-2 h-4 w-4" />
                <span>My Inbox</span>
                {unreadCount > 0 && (
                  <Badge className="ml-auto" variant="secondary" size="sm">
                    {unreadCount}
                  </Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateTo('settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
