'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Building,
  CalendarDays,
  CheckCircle,
  Clock,
  Edit,
  ExternalLink,
  Filter,
  Globe,
  Info,
  Lightbulb,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Phone,
  PlusCircle,
  RefreshCw,
  Star,
  Tag,
  Trash,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface LeadManagerProps {
  workspaceId?: string;
}

export function LeadManager({ workspaceId = 'workspace-1' }: LeadManagerProps) {
  const [leads, setLeads] = React.useState<any[]>([]);
  const [filteredLeads, setFilteredLeads] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = React.useState(false);
  const [selectedLead, setSelectedLead] = React.useState<any>(null);
  const [sortOrder, setSortOrder] = React.useState({ field: 'createdAt', direction: 'desc' });

  // Load leads data
  React.useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock data - in a real app this would come from an API
        const mockLeads = [
          {
            id: 'lead-1',
            name: 'Sarah Johnson',
            company: 'TechSolutions Inc.',
            email: 'sarah.johnson@techsolutions.com',
            phone: '+1 (555) 123-4567',
            position: 'Chief Technology Officer',
            source: 'email',
            sourceDetail: 'Partnership inquiry email from May 12',
            leadType: 'partnership',
            status: 'NEW',
            value: 75000,
            confidence: 0.92,
            notes:
              'Potential strategic partner with complementary technology offerings. Currently expanding operations in our target market.',
            assignedTo: 'John Doe',
            createdAt: '2025-05-12T14:23:00',
            tags: ['technology', 'partnership', 'enterprise'],
            lastContactedAt: null,
            website: 'techsolutions.com',
          },
          {
            id: 'lead-2',
            name: 'Michael Williams',
            company: 'Global Enterprises',
            email: 'michael.williams@globalent.com',
            phone: '+1 (555) 987-6543',
            position: 'VP of Sales',
            source: 'email',
            sourceDetail: 'Product demo request from May 10',
            leadType: 'sales',
            status: 'QUALIFIED',
            value: 120000,
            confidence: 0.87,
            notes:
              'Interested in our enterprise solution. Has a team of 500+ and looking to implement in Q3.',
            assignedTo: 'Jane Smith',
            createdAt: '2025-05-10T09:45:00',
            tags: ['enterprise', 'sales', 'Q3-target'],
            lastContactedAt: '2025-05-11T10:30:00',
            website: 'globalenterprises.com',
          },
          {
            id: 'lead-3',
            name: 'Emily Davis',
            company: 'InnovateTech',
            email: 'emily.davis@innovatetech.io',
            phone: '+1 (555) 234-5678',
            position: 'Product Manager',
            source: 'email',
            sourceDetail: 'Integration inquiry from May 8',
            leadType: 'product',
            status: 'CONTACTED',
            value: 45000,
            confidence: 0.78,
            notes:
              'Looking for API integration options. Smaller company but high growth potential.',
            assignedTo: 'John Doe',
            createdAt: '2025-05-08T16:10:00',
            tags: ['api', 'integration', 'startup'],
            lastContactedAt: '2025-05-09T14:15:00',
            website: 'innovatetech.io',
          },
          {
            id: 'lead-4',
            name: 'Robert Chen',
            company: 'FinTech Solutions',
            email: 'robert.chen@fintechsolutions.com',
            phone: '+1 (555) 345-6789',
            position: 'CIO',
            source: 'email',
            sourceDetail: 'Security features inquiry from May 5',
            leadType: 'enterprise',
            status: 'NEW',
            value: 200000,
            confidence: 0.95,
            notes:
              'Financial technology company interested in our security features. Very promising lead with large potential deal size.',
            assignedTo: null,
            createdAt: '2025-05-05T11:30:00',
            tags: ['finance', 'security', 'enterprise', 'high-value'],
            lastContactedAt: null,
            website: 'fintechsolutions.com',
          },
          {
            id: 'lead-5',
            name: 'Amanda Lopez',
            company: 'Healthcare Innovations',
            email: 'amanda.lopez@healthinnovate.com',
            phone: '+1 (555) 456-7890',
            position: 'Director of Technology',
            source: 'email',
            sourceDetail: 'Compliance features inquiry from May 2',
            leadType: 'healthcare',
            status: 'QUALIFIED',
            value: 150000,
            confidence: 0.89,
            notes:
              'Healthcare company looking for compliance features. Needs HIPAA compliance and secure data handling.',
            assignedTo: 'Jane Smith',
            createdAt: '2025-05-02T13:20:00',
            tags: ['healthcare', 'compliance', 'security'],
            lastContactedAt: '2025-05-04T09:45:00',
            website: 'healthcareinnovations.org',
          },
        ];

        setLeads(mockLeads);
        setFilteredLeads(mockLeads);
      } catch (error) {
        console.error('Error fetching leads:', error);
        toast({
          title: 'Error',
          description: 'Failed to load leads data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [workspaceId]);

  // Handle filtering leads
  React.useEffect(() => {
    let result = [...leads];

    // Apply status filter
    if (activeFilter !== 'all') {
      result = result.filter(lead => lead.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        lead =>
          lead.name.toLowerCase().includes(query) ||
          lead.company.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          (lead.notes && lead.notes.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortOrder.field];
      const bValue = b[sortOrder.field];

      if (sortOrder.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredLeads(result);
  }, [leads, activeFilter, searchQuery, sortOrder]);

  // Handle view lead details
  const handleViewLead = (lead: any) => {
    setSelectedLead(lead);
    setShowDetailsDialog(true);
  };

  // Handle create new lead
  const handleCreateLead = () => {
    setShowCreateDialog(true);
  };

  // Handle saving a new lead
  const handleSaveLead = () => {
    // In a real implementation, this would call an API to save the lead
    toast({
      title: 'Lead Created',
      description: 'New lead has been created successfully',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    });
    setShowCreateDialog(false);

    // Refresh leads list (in a real app this would re-fetch from API)
    // For demo purposes, we'll just add a dummy lead to the list
    const newLead = {
      id: `lead-${leads.length + 1}`,
      name: 'New Lead',
      company: 'New Company',
      email: 'new.lead@example.com',
      phone: '+1 (555) 000-0000',
      position: 'CEO',
      source: 'manual',
      sourceDetail: 'Manually added',
      leadType: 'sales',
      status: 'NEW',
      value: 50000,
      confidence: 1.0,
      notes: 'This is a manually added lead for demonstration purposes.',
      assignedTo: null,
      createdAt: new Date().toISOString(),
      tags: ['demo', 'manual'],
      lastContactedAt: null,
      website: 'example.com',
    };

    setLeads([newLead, ...leads]);
  };

  // Handle changing lead status
  const handleChangeStatus = (leadId: string, newStatus: string) => {
    const updatedLeads = leads.map(lead =>
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    );

    setLeads(updatedLeads);

    toast({
      title: 'Status Updated',
      description: `Lead status changed to ${newStatus.toLowerCase()}`,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    });
  };

  // Handle deleting a lead
  const handleDeleteLead = (leadId: string) => {
    const updatedLeads = leads.filter(lead => lead.id !== leadId);
    setLeads(updatedLeads);

    toast({
      title: 'Lead Deleted',
      description: 'Lead has been removed from the system',
      icon: <Trash className="h-4 w-4" />,
    });

    if (showDetailsDialog && selectedLead?.id === leadId) {
      setShowDetailsDialog(false);
    }
  };

  // Get appropriate badge color based on lead status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-500';
      case 'QUALIFIED':
        return 'bg-green-500';
      case 'CONTACTED':
        return 'bg-amber-500';
      case 'CONVERTED':
        return 'bg-purple-500';
      case 'REJECTED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };

  // Display the loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading leads...</p>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="h-6 w-6" />
          Lead Manager
        </h2>

        <Button onClick={handleCreateLead}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Lead
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-72 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="space-y-1">
                  <Button
                    variant={activeFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setActiveFilter('all')}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    All Leads
                  </Button>
                  <Button
                    variant={activeFilter === 'NEW' ? 'default' : 'outline'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setActiveFilter('NEW')}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    New Leads
                  </Button>
                  <Button
                    variant={activeFilter === 'QUALIFIED' ? 'default' : 'outline'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setActiveFilter('QUALIFIED')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Qualified
                  </Button>
                  <Button
                    variant={activeFilter === 'CONTACTED' ? 'default' : 'outline'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setActiveFilter('CONTACTED')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contacted
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Source</Label>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      /* Filter by source */
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Leads
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      /* Filter by source */
                    }}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => {
                      /* Filter by tag */
                    }}
                  >
                    enterprise
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => {
                      /* Filter by tag */
                    }}
                  >
                    partnership
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => {
                      /* Filter by tag */
                    }}
                  >
                    technology
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <Label>Sort By</Label>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() =>
                      setSortOrder({
                        field: 'createdAt',
                        direction:
                          sortOrder.field === 'createdAt' && sortOrder.direction === 'desc'
                            ? 'asc'
                            : 'desc',
                      })
                    }
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Date{' '}
                    {sortOrder.field === 'createdAt' &&
                      (sortOrder.direction === 'desc' ? '(newest)' : '(oldest)')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() =>
                      setSortOrder({
                        field: 'value',
                        direction:
                          sortOrder.field === 'value' && sortOrder.direction === 'desc'
                            ? 'asc'
                            : 'desc',
                      })
                    }
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Value{' '}
                    {sortOrder.field === 'value' &&
                      (sortOrder.direction === 'desc' ? '(highest)' : '(lowest)')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() =>
                      setSortOrder({
                        field: 'name',
                        direction:
                          sortOrder.field === 'name' && sortOrder.direction === 'asc'
                            ? 'desc'
                            : 'asc',
                      })
                    }
                  >
                    <SortAZ className="h-4 w-4 mr-2" />
                    Name{' '}
                    {sortOrder.field === 'name' &&
                      (sortOrder.direction === 'asc' ? '(A-Z)' : '(Z-A)')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-grow">
          <Card>
            <CardHeader>
              <CardTitle className="text-md flex items-center justify-between">
                <span>
                  {activeFilter === 'all'
                    ? 'All Leads'
                    : activeFilter === 'NEW'
                    ? 'New Leads'
                    : activeFilter === 'QUALIFIED'
                    ? 'Qualified Leads'
                    : activeFilter === 'CONTACTED'
                    ? 'Contacted Leads'
                    : 'Leads'}
                </span>
                <Badge variant="outline">{filteredLeads.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredLeads.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">No leads found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    {searchQuery
                      ? 'No leads match your search criteria.'
                      : 'No leads available in this category.'}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveFilter('all');
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLeads.map(lead => (
                    <div
                      key={lead.id}
                      className="border rounded-md p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {lead.name
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{lead.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {lead.position} at {lead.company}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(lead.status)} text-white`}>
                          {lead.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span>{lead.leadType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>${lead.value.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-muted-foreground" />
                          <span>Source: {lead.source}</span>
                        </div>
                      </div>

                      {lead.tags && lead.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {lead.tags.map((tag: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-muted/50">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-end gap-2 mt-3">
                        <Button variant="outline" size="sm" onClick={() => handleViewLead(lead)}>
                          <Info className="h-4 w-4 mr-2" />
                          View Details
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Change Status
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Change Lead Status</DialogTitle>
                              <DialogDescription>
                                Update the status for {lead.name} from {lead.company}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-2 py-4">
                              <Button
                                variant={lead.status === 'NEW' ? 'default' : 'outline'}
                                className="justify-start"
                                onClick={() => handleChangeStatus(lead.id, 'NEW')}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                New Lead
                              </Button>
                              <Button
                                variant={lead.status === 'QUALIFIED' ? 'default' : 'outline'}
                                className="justify-start"
                                onClick={() => handleChangeStatus(lead.id, 'QUALIFIED')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Qualified Lead
                              </Button>
                              <Button
                                variant={lead.status === 'CONTACTED' ? 'default' : 'outline'}
                                className="justify-start"
                                onClick={() => handleChangeStatus(lead.id, 'CONTACTED')}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Contacted
                              </Button>
                              <Button
                                variant={lead.status === 'CONVERTED' ? 'default' : 'outline'}
                                className="justify-start"
                                onClick={() => handleChangeStatus(lead.id, 'CONVERTED')}
                              >
                                <Star className="h-4 w-4 mr-2" />
                                Converted
                              </Button>
                              <Button
                                variant={lead.status === 'REJECTED' ? 'default' : 'outline'}
                                className="justify-start"
                                onClick={() => handleChangeStatus(lead.id, 'REJECTED')}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Rejected
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[800px]">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Lead Details</span>
                  <Badge className={`${getStatusColor(selectedLead.status)} text-white`}>
                    {selectedLead.status}
                  </Badge>
                </DialogTitle>
                <DialogDescription>Detailed information about this lead</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl">
                      {selectedLead.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold">{selectedLead.name}</h2>
                    <p className="text-muted-foreground">
                      {selectedLead.position} at {selectedLead.company}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {selectedLead.tags.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-muted/50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="info">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="info">Information</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedLead.email}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedLead.phone || 'Not provided'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Company</Label>
                        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedLead.company}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Website</Label>
                        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedLead.website || 'Not provided'}</span>
                          {selectedLead.website && (
                            <Button variant="ghost" size="icon" className="ml-auto h-6 w-6">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Lead Type</Label>
                        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{selectedLead.leadType}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Estimated Value</Label>
                        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>${selectedLead.value.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Source</Label>
                        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                          <Lightbulb className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="capitalize">{selectedLead.source}</span>
                            {selectedLead.sourceDetail && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {selectedLead.sourceDetail}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Assigned To</Label>
                        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedLead.assignedTo || 'Unassigned'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-sm">{selectedLead.notes || 'No notes available.'}</p>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Created: {formatDate(selectedLead.createdAt)}</span>
                        <span>
                          Last Contacted:{' '}
                          {selectedLead.lastContactedAt
                            ? formatDate(selectedLead.lastContactedAt)
                            : 'Never'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <AlertCircle className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          AI Confidence: {Math.round(selectedLead.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="activity">
                    <div className="text-center py-10 text-muted-foreground">
                      <Clock className="h-10 w-10 mx-auto mb-4" />
                      <p>Activity tracking will be available in a future update.</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="notes">
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Add notes about this lead..."
                        rows={5}
                        defaultValue={selectedLead.notes || ''}
                      />
                      <Button className="w-full">Save Notes</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter className="flex justify-between items-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this lead?')) {
                      handleDeleteLead(selectedLead.id);
                    }
                  }}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Lead
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                    Close
                  </Button>
                  <Button>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Lead
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Lead Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Lead</DialogTitle>
            <DialogDescription>Add a new lead to your system</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lead-name">Name *</Label>
                <Input id="lead-name" placeholder="Full name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-company">Company *</Label>
                <Input id="lead-company" placeholder="Company name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-email">Email *</Label>
                <Input id="lead-email" placeholder="Email address" type="email" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-phone">Phone</Label>
                <Input id="lead-phone" placeholder="Phone number" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-position">Position</Label>
                <Input id="lead-position" placeholder="Job title" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-website">Website</Label>
                <Input id="lead-website" placeholder="Website URL" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-type">Lead Type *</Label>
                <Select defaultValue="sales">
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-value">Estimated Value ($)</Label>
                <Input
                  id="lead-value"
                  placeholder="Estimated value"
                  type="number"
                  defaultValue="50000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-tags">Tags</Label>
              <Input id="lead-tags" placeholder="Enter tags separated by commas" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-notes">Notes</Label>
              <Textarea
                id="lead-notes"
                placeholder="Add additional information about this lead..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLead}>Create Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// This would be added to the component but missing from the provided code
function DollarSign(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

// This would be added to the component but missing from the provided code
function SortAZ(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 5h10" />
      <path d="M7 9h4" />
      <path d="M7 5v8" />
      <path d="M15 19h-4l6-8h-4" />
      <path d="M7 19h10" />
    </svg>
  );
}

// This would be added to the component but missing from the provided code
function MapPin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// Missing SelectTrigger, SelectValue, SelectContent, and SelectItem components
// In a real implementation, these would be imported from your UI components library
function Select({ children, defaultValue }: { children: React.ReactNode; defaultValue?: string }) {
  return <div className="relative">{children}</div>;
}

function SelectTrigger({ children }: { children: React.ReactNode }) {
  return (
    <Button variant="outline" className="w-full justify-between">
      {children}
      <ChevronDown className="h-4 w-4" />
    </Button>
  );
}

function SelectValue({ placeholder }: { placeholder: string }) {
  return <span>{placeholder}</span>;
}

function SelectContent({ children }: { children: React.ReactNode }) {
  return <div className="hidden">{children}</div>;
}

function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <div data-value={value}>{children}</div>;
}

function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
