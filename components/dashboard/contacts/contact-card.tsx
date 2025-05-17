'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Contact } from '@/lib/contacts/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Phone, Building, Star, Clock, Tags, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatPhoneNumber, getInitials } from '@/lib/contacts/utils';

interface ContactCardProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onStar?: (id: string, starred: boolean) => void;
}

export function ContactCard({ contact, isSelected, onSelect, onStar }: ContactCardProps) {
  const router = useRouter();

  // Handle viewing the contact details
  const handleViewContact = () => {
    router.push(`/dashboard/contacts/${contact.id}`);
  };

  // Handle starring a contact
  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStar) {
      onStar(contact.id, !contact.isStarred);
    }
  };

  // Handle sending an email
  const handleSendEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/mail/compose?to=${contact.email}`);
  };

  return (
    <Card
      className={`overflow-hidden hover:border-primary/40 transition-colors cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={handleViewContact}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(contact.id)}
              onClick={e => e.stopPropagation()}
              className="data-[state=checked]:bg-primary"
            />
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleStar}>
              <Star
                className={`h-3.5 w-3.5 ${
                  contact.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                }`}
              />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
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
              <DropdownMenuItem onClick={handleSendEmail}>Send Email</DropdownMenuItem>
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

        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            {contact.avatarUrl ? (
              <AvatarImage
                src={contact.avatarUrl}
                alt={`${contact.firstName} ${contact.lastName}`}
              />
            ) : (
              <AvatarFallback>
                {getInitials(`${contact.firstName} ${contact.lastName}`)}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-medium truncate">
              {contact.firstName} {contact.lastName}
            </h3>
            {contact.title && (
              <p className="text-sm text-muted-foreground truncate">{contact.title}</p>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm">
            <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <span className="truncate">{contact.email}</span>
          </div>

          {contact.phone && (
            <div className="flex items-center text-sm">
              <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <span>{formatPhoneNumber(contact.phone)}</span>
            </div>
          )}

          {contact.company && (
            <div className="flex items-center text-sm">
              <Building className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <span className="truncate">{contact.company}</span>
            </div>
          )}
        </div>

        {contact.tags && contact.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {contact.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-1.5 h-5"
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
        )}
      </div>

      <CardFooter className="bg-muted/50 py-2 px-4 text-xs text-muted-foreground">
        {contact.lastContactedAt ? (
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Last contacted: {new Date(contact.lastContactedAt).toLocaleDateString()}</span>
            </div>

            {contact.status && (
              <Badge variant="outline" className="h-5 capitalize text-xs">
                {contact.status}
              </Badge>
            )}
          </div>
        ) : (
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Never contacted</span>
            </div>

            {contact.status && (
              <Badge variant="outline" className="h-5 capitalize text-xs">
                {contact.status}
              </Badge>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
