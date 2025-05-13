import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Mail,
  Users,
  FileText,
  Settings,
  PlusCircle,
  Inbox,
  Send,
  File,
  Trash2,
  Star,
  Bot,
  BrainCircuit,
  Workflow,
  BarChart2,
  ArrowRightToLine,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Zap,
  MessageSquareText,
  BellRing,
  FolderTree,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/hooks/use-media-query";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ className, collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [mailOpen, setMailOpen] = useState(!collapsed);
  const [agentsOpen, setAgentsOpen] = useState(!collapsed);
  const [workflowsOpen, setWorkflowsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
  // Get the base path for highlighting parent items
  const basePath = pathname.split('/').slice(0, 3).join('/');

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "Mail",
      href: "/dashboard/mail",
      icon: Mail,
      badge: "5",
      hasSubmenu: true,
      open: mailOpen,
      setOpen: setMailOpen,
    },
    {
      title: "Contacts",
      href: "/dashboard/contacts",
      icon: Users,
    },
    {
      title: "Templates",
      href: "/dashboard/templates",
      icon: FileText,
    },
    {
      title: "AI Agents",
      href: "/dashboard/agents",
      icon: Bot,
      badge: "New",
      badgeColor: "bg-green-500",
      hasSubmenu: true,
      open: agentsOpen,
      setOpen: setAgentsOpen,
    },
    {
      title: "Workflows",
      href: "/dashboard/workflows",
      icon: Workflow,
      hasSubmenu: true,
      open: workflowsOpen,
      setOpen: setWorkflowsOpen,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const mailNavItems = [
    {
      title: "Inbox",
      href: "/dashboard/mail/inbox",
      icon: Inbox,
      badge: "3",
    },
    {
      title: "Sent",
      href: "/dashboard/mail/sent",
      icon: Send,
    },
    {
      title: "Drafts",
      href: "/dashboard/mail/drafts",
      icon: File,
      badge: "2",
    },
    {
      title: "Trash",
      href: "/dashboard/mail/trash",
      icon: Trash2,
    },
    {
      title: "Important",
      href: "/dashboard/mail/important",
      icon: Star,
    },
  ];

  const agentNavItems = [
    {
      title: "Overview",
      href: "/dashboard/agents",
      icon: BarChart2,
      exact: true,
    },
    {
      title: "My Agents",
      href: "/dashboard/agents/my-agents",
      icon: Bot,
    },
    {
      title: "Training",
      href: "/dashboard/agents/training",
      icon: BrainCircuit,
    },
    {
      title: "Agent Teams",
      href: "/dashboard/agents/teams",
      icon: Users,
    },
    {
      title: "Performance",
      href: "/dashboard/agents/performance",
      icon: Sparkles,
    },
    {
      title: "Knowledge Base",
      href: "/dashboard/agents/knowledge",
      icon: FolderTree,
    },
  ];

  const workflowNavItems = [
    {
      title: "All Workflows",
      href: "/dashboard/workflows",
      icon: ClipboardList,
      exact: true,
    },
    {
      title: "Active Flows",
      href: "/dashboard/workflows/active",
      icon: Zap,
      badge: "12",
    },
    {
      title: "Executions",
      href: "/dashboard/workflows/executions",
      icon: MessageSquareText,
    },
    {
      title: "Approvals",
      href: "/dashboard/workflows/approvals",
      icon: BellRing,
      badge: "3",
      badgeColor: "bg-amber-500",
    },
  ];

  // Function to check if a menu item is active
  const isActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href;
    }
    // For parent items with submenus, we can use basePath to check if any child is active
    if (href.split('/').length === 3) { // Parent menu items like "/dashboard/mail"
      return basePath === href;
    }
    return pathname.startsWith(href);
  };

  // Handle rendering different badge types
  const renderBadge = (badge: string | number, color: string = "bg-primary") => {
    return (
      <span className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full ${color} text-xs text-primary-foreground`}>
        {badge}
      </span>
    );
  };

  return (
    <div className={cn("flex flex-col border-r bg-background", className)}>
      <div className="flex h-14 items-center px-4 py-2 border-b">
        <h2 className="flex-1 text-lg font-semibold tracking-tight">
          {!collapsed && "WorkspaxCRM"}
        </h2>
        {isDesktop && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle} 
            className="ml-auto h-8 w-8"
          >
            <ArrowRightToLine className={cn("h-4 w-4", collapsed && "rotate-180")} />
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className={cn("space-y-2 py-4", collapsed ? "px-2" : "px-4")}>
          <div className="space-y-1">
            <Button 
              asChild 
              variant="default" 
              className={cn("w-full", collapsed ? "justify-center px-0" : "justify-start")}
            >
              <Link href="/dashboard/mail/compose">
                <PlusCircle className={cn("h-4 w-4", !collapsed && "mr-2")} />
                {!collapsed && "Compose"}
              </Link>
            </Button>
          </div>
          
          <Separator className="my-4" />
          
          <nav className="space-y-1.5">
            {mainNavItems.map((item) => {
              // Determine if this item or any of its children is active
              const active = isActive(item.href, item.exact);
              
              if (item.hasSubmenu) {
                // Render collapsible submenu
                return (
                  <Collapsible
                    key={item.href}
                    open={collapsed ? false : item.open}
                    onOpenChange={item.setOpen}
                    className="space-y-1"
                  >
                    <div className="flex">
                      <CollapsibleTrigger asChild className="flex flex-1">
                        <Button
                          variant={active ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-between",
                            collapsed ? "px-2" : "px-3"
                          )}
                        >
                          <div className="flex items-center">
                            <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                            {!collapsed && item.title}
                          </div>
                          {!collapsed && (
                            <div className="flex items-center">
                              {item.badge && renderBadge(item.badge, item.badgeColor)}
                              {item.open ? (
                                <ChevronDown className="ml-2 h-4 w-4" />
                              ) : (
                                <ChevronRight className="ml-2 h-4 w-4" />
                              )}
                            </div>
                          )}
                          {collapsed && item.badge && renderBadge(item.badge, item.badgeColor)}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    
                    <CollapsibleContent className="space-y-1 pl-6">
                      {item.title === "Mail" && mailNavItems.map((subItem) => (
                        <Button
                          key={subItem.href}
                          asChild
                          variant={isActive(subItem.href) ? "secondary" : "ghost"}
                          size="sm"
                          className={cn("w-full justify-start", collapsed && "hidden")}
                        >
                          <Link href={subItem.href}>
                            <subItem.icon className="mr-2 h-4 w-4" />
                            {subItem.title}
                            {subItem.badge && renderBadge(subItem.badge)}
                          </Link>
                        </Button>
                      ))}
                      
                      {item.title === "AI Agents" && agentNavItems.map((subItem) => (
                        <Button
                          key={subItem.href}
                          asChild
                          variant={isActive(subItem.href, subItem.exact) ? "secondary" : "ghost"}
                          size="sm"
                          className={cn("w-full justify-start", collapsed && "hidden")}
                        >
                          <Link href={subItem.href}>
                            <subItem.icon className="mr-2 h-4 w-4" />
                            {subItem.title}
                            {subItem.badge && renderBadge(subItem.badge, subItem.badgeColor)}
                          </Link>
                        </Button>
                      ))}
                      
                      {item.title === "Workflows" && workflowNavItems.map((subItem) => (
                        <Button
                          key={subItem.href}
                          asChild
                          variant={isActive(subItem.href, subItem.exact) ? "secondary" : "ghost"}
                          size="sm"
                          className={cn("w-full justify-start", collapsed && "hidden")}
                        >
                          <Link href={subItem.href}>
                            <subItem.icon className="mr-2 h-4 w-4" />
                            {subItem.title}
                            {subItem.badge && renderBadge(subItem.badge, subItem.badgeColor)}
                          </Link>
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                );
              } else {
                // Render regular nav item
                return (
                  <Button
                    key={item.href}
                    asChild
                    variant={active ? "secondary" : "ghost"}
                    className={cn(
                      "w-full",
                      collapsed ? "justify-center px-2" : "justify-start px-3"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                      {!collapsed && item.title}
                      {!collapsed && item.badge && renderBadge(item.badge, item.badgeColor)}
                      {collapsed && item.badge && renderBadge(item.badge, item.badgeColor)}
                    </Link>
                  </Button>
                );
              }
            })}
          </nav>
        </div>
      </ScrollArea>
      
      {!collapsed && (
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <p className="text-xs text-muted-foreground">
              AI Agents: 4 Active
            </p>
          </div>
        </div>
      )}
    </div>
  );
}