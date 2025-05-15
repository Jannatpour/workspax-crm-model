'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Plus,
  Download,
  Upload,
  Filter,
  MoreHorizontal,
  Mail,
  Trash2,
  Tag,
  UserPlus,
  ListFilter,
  ArrowDownUp,
  UserCircle,
  Globe,
  Phone,
  BuildingOffice,
  ArrowPathIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Briefcase,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useDashboard } from '@/context/dashboard-context';

// Mock contacts data
const mockContacts = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    title: 'Marketing Director',
    tags: ['client', 'marketing'],
    lastActivity: new Date('2023-05-08T14:30:00'),
    leadStatus: 'qualified',
    source: 'website',
    enriched: true,
    linkedinUrl: 'https://linkedin.com/in/johnsmith',
    location: 'New York, NY',
    dateAdded: new Date('2023-01-15'),
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 987-6543',
    company: 'Tech Innovations Inc',
    title: 'CEO',
    tags: ['prospect', 'decision-maker'],
    lastActivity: new Date('2023-05-10T09:15:00'),
    leadStatus: 'new',
    source: 'referral',
    enriched: true,
    linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
    location: 'San Francisco, CA',
    dateAdded: new Date('2023-04-28'),
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@example.com',
    phone: '+1 (555) 456-7890',
    company: 'Global Services LLC',
    title: 'Sales Manager',
    tags: ['partner'],
    lastActivity: new Date('2023-05-05T11:00:00'),
    leadStatus: 'customer',
    source: 'conference',
    enriched: false,
    linkedinUrl: 'https://linkedin.com/in/michaelbrown',
    location: 'Chicago, IL',
    dateAdded: new Date('2022-11-03'),
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@example.com',
    phone: '+1 (555) 789-0123',
    company: 'Creative Solutions',
    title: 'Design Lead',
    tags: ['client'],
    lastActivity: new Date('2023-05-01T16:45:00'),
    leadStatus: 'qualified',
    source: 'email-campaign',
    enriched: true,
    linkedinUrl: 'https://linkedin.com/in/emilydavis',
    location: 'Austin, TX',
    dateAdded: new Date('2023-02-14'),
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@example.com',
    phone: '+1 (555) 234-5678',
    company: 'Wilson Consulting',
    title: 'Principal Consultant',
    tags: ['prospect', 'high-value'],
    lastActivity: new Date('2023-05-09T13:20:00'),
    leadStatus: 'negotiation',
    source: 'linkedin',
    enriched: true,
    linkedinUrl: 'https://linkedin.com/in/davidwilson',
    location: 'Boston, MA',
    dateAdded: new Date('2023-03-22'),
  },
  {
    id: '6',
    firstName: 'Jessica',
    lastName: 'Martinez',
    email: 'jessica.martinez@example.com',
    phone: '+1 (555) 876-5432',
    company: 'Marketing Masters',
    title: 'CMO',
    tags: ['client', 'decision-maker'],
    lastActivity: new Date('2023-05-07T10:30:00'),
    leadStatus: 'customer',
    source: 'webinar',
    enriched: false,
    linkedinUrl: 'https://linkedin.com/in/jessicamartinez',
    location: 'Miami, FL',
    dateAdded: new Date('2022-09-18'),
  },
  {
    id: '7',
    firstName: 'Robert',
    lastName: 'Taylor',
    email: 'robert.taylor@example.com',
    phone: '+1 (555) 345-6789',
    company: 'InnoTech Systems',
    title: 'CTO',
    tags: ['partner', 'technical'],
    lastActivity: new Date('2023-05-06T15:10:00'),
    leadStatus: 'qualified',
    source: 'partner-referral',
    enriched: true,
    linkedinUrl: 'https://linkedin.com/in/roberttaylor',
    location: 'Seattle, WA',
    dateAdded: new Date('2023-01-08'),
  },
];

// Contact list component
const ContactsList = ({ contacts, selectedContacts, onToggleSelect, onViewContact }) => {
  const formatDate = date => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getLeadStatusBadge = status => {
    const statusColors = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      qualified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      negotiation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      customer: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      lost: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };

    return (
      <span
        className={`text-xs px-2 py-1 rounded-full ${
          statusColors[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <Table className="border-b">
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={selectedContacts.length === contacts.length && contacts.length > 0}
              onCheckedChange={checked => {
                if (checked) {
                  onToggleSelect(contacts.map(contact => contact.id));
                } else {
                  onToggleSelect([]);
                }
              }}
            />
          </TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Date Added</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contacts.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
              No contacts found matching your criteria
            </TableCell>
          </TableRow>
        ) : (
          contacts.map(contact => (
            <TableRow key={contact.id}>
              <TableCell>
                <Checkbox
                  checked={selectedContacts.includes(contact.id)}
                  onCheckedChange={() => {
                    if (selectedContacts.includes(contact.id)) {
                      onToggleSelect(selectedContacts.filter(id => id !== contact.id));
                    } else {
                      onToggleSelect([...selectedContacts, contact.id]);
                    }
                  }}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-start gap-2" onClick={() => onViewContact(contact.id)}>
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {contact.firstName.charAt(0) + contact.lastName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium hover:underline cursor-pointer">
                      {contact.firstName} {contact.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">{contact.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{contact.company}</div>
                  <div className="text-sm text-muted-foreground">{contact.title}</div>
                </div>
              </TableCell>
              <TableCell>{getLeadStatusBadge(contact.leadStatus)}</TableCell>
              <TableCell>
                <div className="text-sm capitalize">{contact.source}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{formatDate(contact.dateAdded)}</div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewContact(contact.id)}>
                      <UserCircle className="h-4 w-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Tag className="h-4 w-4 mr-2" />
                      Add Tags
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                      Enrich Data
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

// Contact detail component
const ContactDetail = ({ contactId, onClose }) => {
  const contact = mockContacts.find(c => c.id === contactId);

  if (!contact) {
    return (
      <div className="p-6 text-center">
        <p>Contact not found</p>
        <Button variant="link" onClick={onClose}>
          Back to Contacts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">Contact Profile</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-medium mb-4">
                  {contact.firstName.charAt(0) + contact.lastName.charAt(0)}
                </div>
                <h3 className="text-xl font-bold">
                  {contact.firstName} {contact.lastName}
                </h3>
                <p className="text-muted-foreground">{contact.title}</p>
                <p className="font-medium">{contact.company}</p>

                <div className="flex items-center justify-center gap-2 mt-4">
                  <Badge variant="outline" className="text-xs">
                    {contact.leadStatus.charAt(0).toUpperCase() + contact.leadStatus.slice(1)}
                  </Badge>
                  {contact.enriched && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none text-xs">
                      Enriched
                    </Badge>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${contact.email}`} className="text-sm hover:underline">
                      {contact.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${contact.phone}`} className="text-sm hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                  {contact.linkedinUrl && (
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      <a
                        href={contact.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {contact.location && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{contact.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {contact.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Enrich
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Company</h4>
                  <div className="flex items-center gap-2">
                    <BuildingOffice className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.company}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Title</h4>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.title}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Lead Status</h4>
                  <div>
                    {contact.leadStatus === 'qualified' || contact.leadStatus === 'customer' ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {contact.leadStatus.charAt(0).toUpperCase() + contact.leadStatus.slice(1)}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {contact.leadStatus.charAt(0).toUpperCase() + contact.leadStatus.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Source</h4>
                  <div className="flex items-center gap-2">
                    <span className="capitalize">{contact.source}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Date Added</h4>
                  <div className="flex items-center gap-2">
                    <span>
                      {contact.dateAdded.toLocaleDateString([], {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Last Activity</h4>
                  <div className="flex items-center gap-2">
                    <span>
                      {contact.lastActivity.toLocaleDateString([], {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="activity">
            <TabsList>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="emails">Emails</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="deals">Deals</TabsTrigger>
            </TabsList>
            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recent Activity</h3>
                    <div className="space-y-4">
                      {[1, 2, 3].map((_, index) => (
                        <div key={index} className="flex gap-4 border-b pb-4 last:border-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index % 3 === 0
                                ? 'bg-blue-100 text-blue-700'
                                : index % 3 === 1
                                ? 'bg-green-100 text-green-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {index % 3 === 0 ? (
                              <Mail className="h-4 w-4" />
                            ) : index % 3 === 1 ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Phone className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {index % 3 === 0
                                ? 'Email sent'
                                : index % 3 === 1
                                ? 'Status updated'
                                : 'Call completed'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {index % 3 === 0
                                ? 'Sent follow-up email about the project proposal.'
                                : index % 3 === 1
                                ? 'Updated lead status from "New" to "Qualified".'
                                : 'Had a 30-minute discovery call.'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(
                                Date.now() - (index + 1) * 24 * 60 * 60 * 1000
                              ).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      View All Activity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="emails" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Email History</h3>
                    <div className="space-y-4">
                      {[1, 2].map((_, index) => (
                        <div key={index} className="flex gap-4 border-b pb-4 last:border-0">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {index === 0 ? 'Project Update' : 'Meeting Follow-up'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {index === 0
                                ? 'Here are the latest updates on the project as discussed...'
                                : 'Thank you for your time in our meeting yesterday. As promised...'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {index === 0 ? 'Opened' : 'Replied'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  Date.now() - (index + 1) * 3 * 24 * 60 * 60 * 1000
                                ).toLocaleString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button size="sm" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Send New Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Notes</h3>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div className="border rounded-md p-3">
                        <p className="text-sm">
                          Discussed their interest in our premium plan. They need more user seats
                          and advanced analytics features.
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="border rounded-md p-3">
                        <p className="text-sm">
                          Initial discovery call went well. They're currently using a competitor's
                          product but are unhappy with the support.
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="deals" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Deals</h3>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Deal
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">Annual Subscription</h4>
                            <p className="text-sm text-muted-foreground">
                              Enterprise Plan - 50 seats
                            </p>
                          </div>
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none">
                            Negotiation
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Value</p>
                            <p className="font-medium">$24,000</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Expected Close</p>
                            <p className="font-medium">
                              {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Probability</p>
                            <p className="font-medium">75%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export function ContactsSection() {
  const { changeSection } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [viewContact, setViewContact] = useState(null);

  // Handler for toggling contact selection
  const handleToggleSelect = contactIds => {
    if (Array.isArray(contactIds)) {
      setSelectedContacts(contactIds);
    } else {
      if (selectedContacts.includes(contactIds)) {
        setSelectedContacts(selectedContacts.filter(id => id !== contactIds));
      } else {
        setSelectedContacts([...selectedContacts, contactIds]);
      }
    }
  };

  // Filter contacts based on search term
  const filteredContacts = mockContacts.filter(contact => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();

    return (
      contact.firstName.toLowerCase().includes(searchLower) ||
      contact.lastName.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      contact.company.toLowerCase().includes(searchLower) ||
      contact.title?.toLowerCase().includes(searchLower) ||
      contact.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-4">
      {viewContact ? (
        <ContactDetail contactId={viewContact} onClose={() => setViewContact(null)} />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold">Contacts</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => changeSection('contacts-import')}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" onClick={() => changeSection('contacts-export')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => console.log('Add contact')}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <Card className="lg:w-64 flex-shrink-0">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Lead Status</h3>
                  <div className="space-y-1">
                    {['new', 'qualified', 'negotiation', 'customer', 'lost'].map(status => (
                      <div key={status} className="flex items-center gap-2">
                        <Checkbox id={`status-${status}`} />
                        <label
                          htmlFor={`status-${status}`}
                          className="text-sm capitalize cursor-pointer"
                        >
                          {status}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Source</h3>
                  <div className="space-y-1">
                    {[
                      'website',
                      'referral',
                      'conference',
                      'linkedin',
                      'webinar',
                      'email-campaign',
                    ].map(source => (
                      <div key={source} className="flex items-center gap-2">
                        <Checkbox id={`source-${source}`} />
                        <label
                          htmlFor={`source-${source}`}
                          className="text-sm capitalize cursor-pointer"
                        >
                          {source.replace('-', ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Tags</h3>
                  <div className="space-y-1">
                    {[
                      'client',
                      'prospect',
                      'partner',
                      'decision-maker',
                      'high-value',
                      'technical',
                    ].map(tag => (
                      <div key={tag} className="flex items-center gap-2">
                        <Checkbox id={`tag-${tag}`} />
                        <label htmlFor={`tag-${tag}`} className="text-sm capitalize cursor-pointer">
                          {tag.replace('-', ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <ListFilter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </CardContent>
            </Card>

            <div className="flex-1">
              <Card>
                <CardHeader className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search contacts..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <ArrowDownUp className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Filter className="h-4 w-4 mr-2" />
                          Sort
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
                        <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
                        <DropdownMenuItem>Company (A-Z)</DropdownMenuItem>
                        <DropdownMenuItem>Date Added (Newest)</DropdownMenuItem>
                        <DropdownMenuItem>Date Added (Oldest)</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {selectedContacts.length > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-muted/50 border-b">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedContacts([])}>
                        Deselect
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {selectedContacts.length} selected
                      </span>
                      <div className="flex-1"></div>
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Tag className="h-4 w-4 mr-2" />
                        Tag
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            More
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <ArrowPathIcon className="h-4 w-4 mr-2" />
                            Enrich Data
                          </DropdownMenuItem>
                          <DropdownMenuItem>Update Lead Status</DropdownMenuItem>
                          <DropdownMenuItem>Add to Campaign</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}

                  <ScrollArea className="h-[calc(100vh-16rem)]">
                    <ContactsList
                      contacts={filteredContacts}
                      selectedContacts={selectedContacts}
                      onToggleSelect={handleToggleSelect}
                      onViewContact={setViewContact}
                    />

                    <div className="flex items-center justify-between p-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Showing {filteredContacts.length} of {mockContacts.length} contacts
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" disabled>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          1
                        </Button>
                        <Button variant="outline" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
