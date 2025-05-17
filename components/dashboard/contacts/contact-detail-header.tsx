'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Contact } from '@/lib/contacts/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Star,
  Mail,
  Phone,
  MoreHorizontal,
  PencilLine,
  FilePlus,
  CalendarPlus,
  Tags,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { getInitials } from '@/lib/contacts/utils';

interface ContactDetailHeaderProps {
  contact: Contact;
  onStar?: (starred: boolean) => void;
  onDelete?: () => void;
}

export function ContactDetailHeader({ contact, onStar, onDelete }: ContactDetailHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-muted/40 rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <Avatar className="h-24 w-24 md:h-28 md:w-28">
          {contact.avatarUrl ? (
            <AvatarImagesrc={contact.avatarUrl}alt={`${contact.firstName} ${contact.lastName}`}/>
          ) : (
            <AvatarFallback className="text-3xl">
              {getInitials(`${contact.firstName} ${contact.lastName}`)}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {contact.firstName} {contact.lastName}
              </h1>

              {contact.title && contact.company ? (
                <p className="text-muted-foreground">
                  {contact.title} at {contact.company}
                </p>
              ) : contact.title ? (
                <p className="text-muted-foreground">{contact.title}</p>
              ) : contact.company ? (
                <p className="text-muted-foreground">{contact.company}</p>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onStar && onStar(!contact.isStarred)}
              >
                <Star
                  className={`h-5 w-5 ${
                    contact.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                  }`}
                />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => router.push(`/dashboard/contacts/${contact.id}/edit`)}
                  >
                    <PencilLine className="h-4 w-4 mr-2" />
                    Edit Contact
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(contact.email);
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Email
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

<DropdownMenuItem
                    onClick={() => router.push(`/dashboard/contacts/${contact.id}/notes/new`)}
                  >
                    <FilePlus className="h-4 w-4 mr-2" />
                    Add Note
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push(`/dashboard/contacts/${contact.id}/tasks/new`)}
                  >
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Add Task
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push(`/dashboard/contacts/${contact.id}/tags`)}
                  >
                    <Tags className="h-4 w-4 mr-2" />
                    Manage Tags
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Contact
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {contact.status && (
              <Badge
                variant={
                  contact.status === 'active' || contact.status === 'customer'
                    ? 'default'
                    : 'outline'
                }
                className="capitalize"
              >
                {contact.status === 'active' || contact.status === 'customer' ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {contact.status}
              </Badge>
            )}

            {contact.tags?.map(tag => (
              <Badge
                key={tag.id}
                variant="outline"
                style={{
                  backgroundColor: `${tag.color}10`,
                  borderColor: tag.color,
                  color: tag.color,
                }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-4">
            <Button
              variant="default"
              className="justify-start"
              onClick={() => router.push(`/dashboard/mail/compose?to=${contact.email}`)}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>

            {contact.phone && (
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => window.open(`tel:${contact.phone}`)}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
