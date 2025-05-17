'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Users,
  Search,
  PlusCircle,
  Filter,
  ChevronDown,
  X,
  SlidersHorizontal,
  UserPlus,
  Mail,
  Download,
  Upload,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Star,
  StarOff,
  Trash2,
  Tag,
  CheckCheck,
  Calendar,
  MessageSquare,
  Copy,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { useToast } from '@/components/ui/sonner';
import { useDashboard } from '@/context/dashboard-context';
import { cn, formatDate } from '@/lib/utils';

// Types
interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  status?: 'active' | 'inactive' | 'lead' | 'customer' | 'prospect' | 'archived';
  isStarred?: boolean;
  lastContactedAt?: string;
  nextFollowUpDate?: string;
  tags?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  engagementScore?: 'high' | 'medium' | 'low' | 'none';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper function to get initials
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Mock data for demo
const mockContacts: Contact[] = Array.from({ length: 20 }, (_, i) => ({
  id: `contact-${i + 1}`,
  firstName: ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Maria'][i % 8],
  lastName: ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson'][i % 8],
  email: `contact${i + 1}@example.com`,
  phone: i % 3 === 0 ? `(555) ${100 + i}-${1000 + i}` : undefined,
  company: i % 4 === 0 ? ['Acme Inc', 'TechCorp', 'GlobalSoft', 'DataSystems'][i % 4] : undefined,
  title:
    i % 5 === 0
      ? ['CEO', 'Marketing Director', 'Sales Manager', 'Developer', 'Designer'][i % 5]
      : undefined,
  status: ['active', 'inactive', 'lead', 'customer', 'prospect', 'archived'][i % 6] as any,
  isStarred: i % 7 === 0,
  lastContactedAt: i % 2 === 0 ? new Date(Date.now() - i * 86400000).toISOString() : undefined,
  nextFollowUpDate: i % 3 === 0 ? new Date(Date.now() + i * 86400000).toISOString() : undefined,
  tags:
    i % 2 === 0
      ? [
          { id: '1', name: 'VIP', color: '#FFA500' },
          { id: '2', name: 'Sales', color: '#3B82F6' },
        ]
      : i % 3 === 0
      ? [{ id: '3', name: 'Marketing', color: '#6366F1' }]
      : [],
  engagementScore: ['high', 'medium', 'low', 'none'][i % 4] as any,
  createdAt: new Date(Date.now() - i * 86400000 * 10).toISOString(),
  updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

// View mode options
type ViewMode = 'table' | 'grid';

export function ContactsPage() {
  const router = useRouter();
  const { changeSection } = useDashboard();
  const { toast } = useToast();

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [sortField, setSortField] = useState<string>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const contactsPerPage = 10;

  // Debounce search to improve performance
  useEffect(() => {
    const handler = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, selectedStatus, sortField, sortDirection, contacts]);

  // Fetch contacts on mount
  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        setContacts(mockContacts);
        setIsLoading(false);
      }, 500);
    };

    fetchContacts();
  }, []);

  // Apply filters, search, and sorting
  const applyFilters = () => {
    let results = [...contacts];

    // Apply search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      results = results.filter(
        contact =>
          contact.firstName.toLowerCase().includes(searchLower) ||
          contact.lastName.toLowerCase().includes(searchLower) ||
          contact.email.toLowerCase().includes(searchLower) ||
          (contact.company && contact.company.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      results = results.filter(contact => contact.status === selectedStatus);
    }

    // Apply sorting
    results.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Handle different field types
      switch (sortField) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'company':
          aValue = (a.company || '').toLowerCase();
          bValue = (b.company || '').toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'lastContactedAt':
          aValue = a.lastContactedAt ? new Date(a.lastContactedAt).getTime() : 0;
          bValue = b.lastContactedAt ? new Date(b.lastContactedAt).getTime() : 0;
          break;
        case 'nextFollowUpDate':
          aValue = a.nextFollowUpDate ? new Date(a.nextFollowUpDate).getTime() : Infinity;
          bValue = b.nextFollowUpDate ? new Date(b.nextFollowUpDate).getTime() : Infinity;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          aValue = a[sortField as keyof Contact] || '';
          bValue = b[sortField as keyof Contact] || '';
      }

      // Compare values
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    setFilteredContacts(results);
    setCurrentPage(1);

    // Check if we should select all contacts
    setIsAllSelected(selectedContacts.length > 0 && selectedContacts.length === results.length);
  };

  // Handle selection of all contacts
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    }
    setIsAllSelected(!isAllSelected);
  };

  // Handle selection of a single contact
  const handleSelectContact = (contactId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedContacts(prev => [...prev, contactId]);
    } else {
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle star/unstar contact
  const handleToggleStar = (contactId: string) => {
    setContacts(
      contacts.map(contact =>
        contact.id === contactId ? { ...contact, isStarred: !contact.isStarred } : contact
      )
    );

    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      toast({
        title: contact.isStarred ? 'Contact unstarred' : 'Contact starred',
        description: `${contact.firstName} ${contact.lastName} has been ${
          contact.isStarred ? 'removed from' : 'added to'
        } your starred contacts.`,
      });
    }
  };

  // Handle contact click to view details
  const handleContactClick = (contactId: string) => {
    changeSection('contacts-detail', { id: contactId });
  };

  // Handle delete contact(s)
  const handleDeleteContacts = () => {
    setContacts(contacts.filter(contact => !selectedContacts.includes(contact.id)));

    toast({
      title:
        selectedContacts.length > 1
          ? `${selectedContacts.length} contacts deleted`
          : 'Contact deleted',
      description: 'The selected contacts have been removed from your database.',
    });

    setSelectedContacts([]);
    setIsDeleteDialogOpen(false);
  };

  // Handle add contact
  const handleAddContact = () => {
    changeSection('contacts-new');
  };

  // Pagination calculation
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * contactsPerPage,
    currentPage * contactsPerPage
  );

  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="h-8 w-32 bg-muted rounded"></div>
          <div className="flex gap-2">
            <div className="h-10 w-28 bg-muted rounded"></div>
            <div className="h-10 w-28 bg-muted rounded"></div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full md:w-64 h-10 bg-muted rounded"></div>
          <div className="flex gap-2">
            <div className="h-10 w-10 bg-muted rounded"></div>
            <div className="h-10 w-10 bg-muted rounded"></div>
          </div>
        </div>

        <div className="border rounded-md">
          <div className="h-12 border-b flex items-center px-4 gap-4">
            <div className="h-5 w-5 rounded bg-muted"></div>
            <div className="h-5 w-32 bg-muted rounded"></div>
            <div className="h-5 w-36 bg-muted rounded"></div>
            <div className="h-5 w-28 bg-muted rounded"></div>
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 border-b flex items-center px-4 gap-4">
              <div className="h-5 w-5 rounded bg-muted"></div>
              <div className="h-10 w-10 rounded-full bg-muted"></div>
              <div className="h-5 w-40 bg-muted rounded"></div>
              <div className="h-5 w-36 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render the main contacts page
  return (
    <div className="p-6 space-y-6">
      {/* Header with title and primary actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            {filteredContacts.length}
            {selectedStatus !== 'all' ? ` ${selectedStatus}` : ''}
            {filteredContacts.length !== contacts.length ? ` out of ${contacts.length} total` : ''}
            contacts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => changeSection('contacts-import')}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={() => changeSection('contacts-export')}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleAddContact}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Search and filter controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-10 w-full md:w-64"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full md:w-36">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>View Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuCheckboxItem
                  checked={viewMode === 'table'}
                  onCheckedChange={() => setViewMode('table')}
                >
                  Table View
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={viewMode === 'grid'}
                  onCheckedChange={() => setViewMode('grid')}
                >
                  Grid View
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuCheckboxItem
                  checked={sortField === 'name'}
                  onCheckedChange={() => handleSort('name')}
                >
                  Name{' '}
                  {sortField === 'name' &&
                    (sortDirection === 'asc' ? (
                      <ArrowUp className="ml-auto h-4 w-4" />
                    ) : (
                      <ArrowDown className="ml-auto h-4 w-4" />
                    ))}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortField === 'company'}
                  onCheckedChange={() => handleSort('company')}
                >
                  Company{' '}
                  {sortField === 'company' &&
                    (sortDirection === 'asc' ? (
                      <ArrowUp className="ml-auto h-4 w-4" />
                    ) : (
                      <ArrowDown className="ml-auto h-4 w-4" />
                    ))}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortField === 'updatedAt'}
                  onCheckedChange={() => handleSort('updatedAt')}
                >
                  Last Updated{' '}
                  {sortField === 'updatedAt' &&
                    (sortDirection === 'asc' ? (
                      <ArrowUp className="ml-auto h-4 w-4" />
                    ) : (
                      <ArrowDown className="ml-auto h-4 w-4" />
                    ))}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortField === 'createdAt'}
                  onCheckedChange={() => handleSort('createdAt')}
                >
                  Created{' '}
                  {sortField === 'createdAt' &&
                    (sortDirection === 'asc' ? (
                      <ArrowUp className="ml-auto h-4 w-4" />
                    ) : (
                      <ArrowDown className="ml-auto h-4 w-4" />
                    ))}
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
          >
            {viewMode === 'table' ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Selected actions */}
      {selectedContacts.length > 0 && (
        <div className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{selectedContacts.length} selected</span>
            <Button variant="ghost" size="sm" onClick={() => setSelectedContacts([])}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Handle email action
                changeSection('mail-compose', {
                  to: selectedContacts
                    .map(id => {
                      const contact = contacts.find(c => c.id === id);
                      return contact ? contact.email : '';
                    })
                    .filter(Boolean)
                    .join(','),
                });
              }}
            >
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
            <Button variant="ghost" size="sm">
              <Tag className="h-4 w-4 mr-1" />
              Tag
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Contacts Table View */}
      {viewMode === 'table' && (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all contacts"
                    />
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      Name
                      {sortField === 'name' &&
                        (sortDirection === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hidden md:table-cell"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center gap-1">
                      Email
                      {sortField === 'email' &&
                        (sortDirection === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hidden lg:table-cell"
                    onClick={() => handleSort('company')}
                  >
                    <div className="flex items-center gap-1">
                      Company
                      {sortField === 'company' &&
                        (sortDirection === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead
                    className="cursor-pointer hidden xl:table-cell"
                    onClick={() => handleSort('updatedAt')}
                  >
                    <div className="flex items-center gap-1">
                      Last Updated
                      {sortField === 'updatedAt' &&
                        (sortDirection === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedContacts.length > 0 ? (
                  paginatedContacts.map(contact => (
                    <TableRow
                      key={contact.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={e => {
                        // Don't navigate if clicking on a button
                        if ((e.target as HTMLElement).closest('button')) return;
                        handleContactClick(contact.id);
                      }}
                    >
                      <TableCell className="p-3">
                        <Checkbox
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={checked => {
                            handleSelectContact(contact.id, checked === true);
                          }}
                          onClick={e => e.stopPropagation()}
                          aria-label={`Select ${contact.firstName} ${contact.lastName}`}
                        />
                      </TableCell>
                      <TableCell className="p-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={e => {
                            e.stopPropagation();
                            handleToggleStar(contact.id);
                          }}
                        >
                          {contact.isStarred ? (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <Star className="h-4 w-4 text-muted-foreground" />
                          )}
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
                              <AvatarFallback>
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
                      <TableCell className="hidden md:table-cell">{contact.email}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {contact.company || '—'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {contact.status && (
                          <Badge
                            variant="outline"
                            className={cn(
                              'capitalize text-xs',
                              contact.status === 'active' &&
                                'border-green-500 text-green-500 bg-green-50 dark:bg-green-950/20',
                              contact.status === 'inactive' &&
                                'border-gray-500 text-gray-500 bg-gray-50 dark:bg-gray-950/20',
                              contact.status === 'lead' &&
                                'border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-950/20',
                              contact.status === 'customer' &&
                                'border-purple-500 text-purple-500 bg-purple-50 dark:bg-purple-950/20',
                              contact.status === 'prospect' &&
                                'border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-950/20'
                            )}
                          >
                            {contact.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-muted-foreground text-sm">
                        {formatDate(contact.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleContactClick(contact.id)}>
                              <User className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => changeSection('contacts-edit', { id: contact.id })}
                            >
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Edit Contact
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => changeSection('mail-compose', { to: contact.email })}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleStar(contact.id)}>
                              {contact.isStarred ? (
                                <>
                                  <StarOff className="h-4 w-4 mr-2" />
                                  Unstar
                                </>
                              ) : (
                                <>
                                  <Star className="h-4 w-4 mr-2" />
                                  Star
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedContacts([contact.id]);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-500 focus:text-red-500"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-32">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Users className="h-10 w-10 mb-2" />
                        <p className="mb-2">No contacts found</p>
                        <Button variant="outline" size="sm" onClick={handleAddContact}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Contact
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Contacts Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedContacts.length > 0 ? (
            paginatedContacts.map(contact => (
              <Card
                key={contact.id}
                className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleContactClick(contact.id)}
              >
                <div className="flex justify-between items-start p-3">
                  <Checkbox
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={checked => {
                      handleSelectContact(contact.id, checked === true);
                    }}
                    onClick={e => e.stopPropagation()}
                    aria-label={`Select ${contact.firstName} ${contact.lastName}`}
                  />
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={e => {
                        e.stopPropagation();
                        handleToggleStar(contact.id);
                      }}
                    >
                      {contact.isStarred ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <Star className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleContactClick(contact.id)}>
                          <User className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => changeSection('contacts-edit', { id: contact.id })}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Edit Contact
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => changeSection('mail-compose', { to: contact.email })}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleStar(contact.id)}>
                          {contact.isStarred ? (
                            <>
                              <StarOff className="h-4 w-4 mr-2" />
                              Unstar
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-2" />
                              Star
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedContacts([contact.id]);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <CardContent className="p-0">
                  <div className="py-3 px-4 flex flex-col items-center text-center">
                    <Avatar className="h-16 w-16 mb-3">
                      {contact.avatarUrl ? (
                        <AvatarImage
                          src={contact.avatarUrl}
                          alt={`${contact.firstName} ${contact.lastName}`}
                        />
                      ) : (
                        <AvatarFallback className="text-lg">
                          {getInitials(`${contact.firstName} ${contact.lastName}`)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <h3 className="font-medium text-base mb-0.5">
                      {contact.firstName} {contact.lastName}
                    </h3>
                    {contact.title && contact.company && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {contact.title} at {contact.company}
                      </p>
                    )}
                    {contact.status && (
                      <Badge
                        variant="outline"
                        className={cn(
                          'capitalize',
                          contact.status === 'active' &&
                            'border-green-500 text-green-500 bg-green-50 dark:bg-green-950/20',
                          contact.status === 'inactive' &&
                            'border-gray-500 text-gray-500 bg-gray-50 dark:bg-gray-950/20',
                          contact.status === 'lead' &&
                            'border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-950/20',
                          contact.status === 'customer' &&
                            'border-purple-500 text-purple-500 bg-purple-50 dark:bg-purple-950/20',
                          contact.status === 'prospect' &&
                            'border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-950/20'
                        )}
                      >
                        {contact.status}
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  <div className="py-3 px-4 space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                      <p className="text-sm truncate">{contact.email}</p>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                        <p className="text-sm">{contact.phone}</p>
                      </div>
                    )}
                    {contact.company && (
                      <div className="flex items-center text-sm">
                        <Building className="h-4 w-4 mr-3 text-muted-foreground" />
                        <p className="text-sm">{contact.company}</p>
                      </div>
                    )}
                  </div>

                  {contact.tags && contact.tags.length > 0 && (
                    <div className="pb-3 px-4 flex flex-wrap gap-1">
                      {contact.tags.map(tag => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="px-1.5 text-xs"
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
                </CardContent>

                <CardFooter className="p-0 border-t">
                  <div className="grid grid-cols-3 divide-x w-full">
                    <Button
                      variant="ghost"
                      className="rounded-none h-10"
                      onClick={e => {
                        e.stopPropagation();
                        changeSection('mail-compose', { to: contact.email });
                      }}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="rounded-none h-10"
                      onClick={e => {
                        e.stopPropagation();
                        // Handle add note - redirect to notes section when implemented
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="rounded-none h-10"
                      onClick={e => {
                        e.stopPropagation();
                        changeSection('contacts-edit', { id: contact.id });
                      }}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="border-dashed p-8">
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                  <Users className="h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No contacts found</h3>
                  <p className="mb-4">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedStatus('all');
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                    <Button onClick={handleAddContact}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredContacts.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * contactsPerPage + 1} to{' '}
            {Math.min(currentPage * contactsPerPage, filteredContacts.length)} of{' '}
            {filteredContacts.length} contacts
          </p>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </Button>
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={i}>
                    {pageNum === '...' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        isActive={currentPage === pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete{' '}
              {selectedContacts.length > 1 ? `${selectedContacts.length} contacts` : 'contact'}
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The{' '}
              {selectedContacts.length > 1 ? 'contacts' : 'contact'} will be permanently removed
              from your database.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {selectedContacts.length <= 3 &&
              selectedContacts.map(id => {
                const contact = contacts.find(c => c.id === id);
                if (!contact) return null;
                return (
                  <div key={id} className="flex items-center space-x-3 p-2 border rounded-md">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getInitials(`${contact.firstName} ${contact.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                    </div>
                  </div>
                );
              })}
            {selectedContacts.length > 3 && (
              <p className="text-sm text-muted-foreground">
                {selectedContacts.length} contacts selected for deletion.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteContacts}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
