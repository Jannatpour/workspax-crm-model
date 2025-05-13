'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import React from 'react';
import { Menu } from 'lucide-react';
import { useSidebarStore } from '@/hooks/use-sidebar';

export function ClientSidebar() {
  const { collapsed, toggleCollapsed } = useSidebarStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div
        className={`hidden lg:block transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[60px]' : 'w-[240px]'
        }`}
      >
        <Sidebar className="h-full" collapsed={collapsed} onToggle={toggleCollapsed} />
      </div>
    </>
  );
}
