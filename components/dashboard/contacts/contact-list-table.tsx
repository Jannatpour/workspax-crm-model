'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Contact } from '@/lib/contacts/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Mail, MoreHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatPhoneNumber, getInitials } from '@/lib/contacts/utils';

interface ContactListTableProps {
  contacts: Contact[];
  selectedContacts: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onStar?: (id: string, starred: boolean) => void;
}

export function ContactListTable({
  contacts,
  selectedContacts,
  onSelect,
  onSelectAll,
  onStar,
}: ContactListTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = React.useState<string>('name');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedContacts.length === contacts.length && contacts.length > 0}
                onCheckedChange={onSelectAll}
                aria-label="Select all contacts"
              />
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
              <div className="flex items-center">
                Name
                {sortField === 'name' &&
                  (sortDirection === 'asc' ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('email')} className="cursor-pointer">
              <div className="flex items-center">
                Email
                {sortField === 'email' &&
                  (sortDirection === 'asc' ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort('company')}
              className="cursor-pointer hidden md:table-cell"
            >
              <div className="flex items-center">
                Company
                {sortField === 'company' &&
                  (sortDirection === 'asc' ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </TableHead>
            <TableHead className="hidden lg:table-cell">Phone</TableHead>
            <TableHead className="hidden lg:table-cell">Status</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No contacts found.
              </TableCell>
            </TableRow>
          ) : (
            contacts.map(contact => (
              <TableRow
                key={contact.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/dashboard/contacts/${contact.id}`)}
              >
                <TableCell className="p-2" onClick={e => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={() => onSelect(contact.id)}
                    aria-label={`Select ${contact.firstName} ${contact.lastName}`}
                  />
                </TableCell>
                <TableCell className="p-2" onClick={e => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onStar && onStar(contact.id, !contact.isStarred)}
                    className="h-8 w-8"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        contact.isStarred
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {contact.avatarUrl ? (
                        <AvatarImage
                          src={contact.avatarUrl}
                          alt={`${contact.firstName} ${contact.lastName}`}
                        />
                      ) : (
                        <AvatarFallback className="text-xs">
                          {getInitials(`${contact.firstName} ${contact.lastName}`)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </div>
                      {contact.title && (
                        <div className="text-xs text-muted-foreground">{contact.title}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell className="hidden md:table-cell">{contact.company || '-'}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {contact.phone ? formatPhoneNumber(contact.phone) : '-'}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {contact.status ? (
                    <Badge variant="outline" className="capitalize">
                      {contact.status}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={e => {
                        e.stopPropagation();
                        router.push(`/dashboard/mail/compose?to=${contact.email}`);
                      }}
                      className="h-8 w-8"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={e => {
                            e.stopPropagation();
                            router.push(`/dashboard/contacts/${contact.id}`);
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={e => {
                            e.stopPropagation();
                            router.push(`/dashboard/contacts/${contact.id}/edit`);
                          }}
                        >
                          Edit Contact
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={e => {
                            e.stopPropagation();
                            router.push(`/dashboard/contacts/${contact.id}/notes/new`);
                          }}
                        >
                          Add Note
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={e => {
                            e.stopPropagation();
                            router.push(`/dashboard/contacts/${contact.id}/tasks/new`);
                          }}
                        >
                          Add Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
