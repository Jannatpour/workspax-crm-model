'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserPlus, Upload, Download, Filter, Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useContacts } from '@/hooks/use-contacts';

export function ContactsHeader() {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useContacts();

  return (
    <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground">Manage your business contacts</p>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search contacts..."
            className="pl-8 w-full md:w-[280px]"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push('/dashboard/contacts/import')}>
            <Upload className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Import</span>
          </Button>

          <Button variant="outline" onClick={() => router.push('/dashboard/contacts/export')}>
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          <Button onClick={() => router.push('/dashboard/contacts/new')}>
            <UserPlus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Contact</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
