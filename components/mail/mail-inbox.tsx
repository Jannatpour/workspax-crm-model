'use client';
import React, { useState } from 'react';
import { EmailStats } from '@/components/dashboard/email-stats';
import { RecentEmails } from '@/components/dashboard/recent-emails';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PlusCircle,
  Mail,
  Search,
  Filter,
  ArrowDownUp,
  RefreshCw,
  Star,
  Trash,
  Archive,
  Clock,
  Tag,
  FileText,
  Send,
  File,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  Inbox,
  Eye,
  Users,
  Calendar,
  ChevronRight,
  BarChart2,
  TrendingUp,
  MousePointer,
  MessageCircle,
  MailOpen,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

export function MailInbox() {
  const { changeSection } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'compact' | 'comfortable'>('comfortable');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Email counts for demonstration
  const emailCounts = {
    inbox: 24,
    unread: 12,
    starred: 7,
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle refresh action
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header with title and actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Email</h2>
            <p className="text-muted-foreground">Manage your communications and messages</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Button onClick={() => changeSection('mail-compose')} className="sm:w-auto w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Compose Email
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Simplified Sidebar */}
        {/* <div className="lg:col-span-1">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b border-blue-100 dark:border-blue-900 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MailOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Mail
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-280px)] min-h-[300px]">
                <div className="space-y-1 p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-between flex items-center hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={() => changeSection('mail-inbox')}
                  >
                    <div className="flex items-center gap-2">
                      <Inbox className="h-4 w-4 text-blue-600" />
                      <span>Inbox</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {emailCounts.inbox}
                    </Badge>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-between flex items-center hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={() => changeSection('mail-important')}
                  >
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span>Starred</span>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      {emailCounts.starred}
                    </Badge>
                  </Button>
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-t border-blue-100 dark:border-blue-900 py-2.5 px-4 justify-between items-center">
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">{emailCounts.unread}</span> unread of{' '}
                <span className="font-medium">{emailCounts.inbox}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardFooter>
          </Card>
        </div> */}

        {/* Main email content */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b border-blue-100 dark:border-blue-900 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Inbox</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8">
                    <Filter className="h-3.5 w-3.5 mr-1" /> Filter
                  </Button>
                  <Select defaultValue="newest">
                    <SelectTrigger className="h-8 w-[130px]">
                      <ArrowDownUp className="h-3.5 w-3.5 mr-1" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="sender">Sender Name</SelectItem>
                      <SelectItem value="subject">Subject</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CardDescription>You have {emailCounts.unread} unread messages</CardDescription>
            </CardHeader>

            <Tabs defaultValue="inbox" className="w-full">
              <div className="px-4 pt-2">
                <TabsList className="w-full grid grid-cols-2 md:w-auto md:inline-flex">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="inbox">Inbox</TabsTrigger>
                </TabsList>
              </div>

              <CardContent className="p-0">
                <TabsContent value="overview" className="m-0 border-0">
                  <div className="p-4 space-y-6">
                    {/* Email Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email Performance Card */}
                      <Card className="overflow-hidden border-blue-100 dark:border-blue-900">
                        <CardHeader className="pb-2 bg-blue-50/50 dark:bg-blue-950/50 border-b border-blue-100 dark:border-blue-900">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                              <BarChart2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              Email Performance
                            </CardTitle>
                            <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                              Last 30 days
                            </Badge>
                          </div>
                          <CardDescription>Key metrics and engagement analytics</CardDescription>
                        </CardHeader>

                        <CardContent className="p-0">
                          <div className="grid grid-cols-2 gap-0">
                            {/* Open Rate */}
                            <div className="p-4 border-r border-b border-dashed border-blue-100 dark:border-blue-900 flex flex-col justify-center items-center text-center">
                              <div className="bg-blue-50 dark:bg-blue-950 rounded-full p-2 mb-2">
                                <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">Open Rate</p>
                              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                46.0%
                              </h3>
                              <div className="flex items-center text-xs mt-1 text-green-600 dark:text-green-400">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                <span>5.2% vs previous</span>
                              </div>
                            </div>

                            {/* Click Rate */}
                            <div className="p-4 border-b border-dashed border-blue-100 dark:border-blue-900 flex flex-col justify-center items-center text-center">
                              <div className="bg-indigo-50 dark:bg-indigo-950 rounded-full p-2 mb-2">
                                <MousePointer className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">Click Rate</p>
                              <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                20.0%
                              </h3>
                              <div className="flex items-center text-xs mt-1 text-green-600 dark:text-green-400">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                <span>3.1% vs previous</span>
                              </div>
                            </div>

                            {/* Response Rate */}
                            <div className="p-4 border-r border-dashed border-blue-100 dark:border-blue-900 flex flex-col justify-center items-center text-center">
                              <div className="bg-green-50 dark:bg-green-950 rounded-full p-2 mb-2">
                                <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">Response Rate</p>
                              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                                38.5%
                              </h3>
                              <div className="flex items-center text-xs mt-1 text-green-600 dark:text-green-400">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                <span>2.8% vs previous</span>
                              </div>
                            </div>

                            {/* Avg. Response Time */}
                            <div className="p-4 flex flex-col justify-center items-center text-center">
                              <div className="bg-amber-50 dark:bg-amber-950 rounded-full p-2 mb-2">
                                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">Response Time</p>
                              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                42 min
                              </h3>
                              <div className="flex items-center text-xs mt-1 text-green-600 dark:text-green-400">
                                <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                                <span>12% decrease</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="bg-blue-50/50 dark:bg-blue-950/50 border-t border-blue-100 dark:border-blue-900 py-2 px-4 flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">
                            Based on 532 email conversations
                          </p>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            View detailed analytics
                          </Button>
                        </CardFooter>
                      </Card>

                      {/* Trending Topics Card */}
                      <Card className="overflow-hidden border-indigo-100 dark:border-indigo-900">
                        <CardHeader className="pb-2 bg-indigo-50/50 dark:bg-indigo-950/50 border-b border-indigo-100 dark:border-indigo-900">
                          <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            Email Activity
                          </CardTitle>
                          <CardDescription>Your communication trends</CardDescription>
                        </CardHeader>

                        <CardContent className="p-4">
                          <div className="space-y-6">
                            {/* Email volume graph would go here in a real implementation */}
                            <div className="h-[160px] bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 rounded-lg flex items-center justify-center">
                              <p className="text-muted-foreground text-sm">
                                Email volume visualization
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Top Senders</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm">John Doe</p>
                                  <Badge variant="outline" className="text-xs">
                                    32
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm">Sarah Smith</p>
                                  <Badge variant="outline" className="text-xs">
                                    28
                                  </Badge>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Most Active Times</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm">Tuesdays</p>
                                  <Badge variant="outline" className="text-xs">
                                    42%
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm">10:00 - 12:00</p>
                                  <Badge variant="outline" className="text-xs">
                                    35%
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="bg-indigo-50/50 dark:bg-indigo-950/50 border-t border-indigo-100 dark:border-indigo-900 py-2 px-4 flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">Last 30 days activity</p>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            View insights
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>

                    {/* Recent Emails */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">Recent Emails</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => changeSection('mail-inbox')}
                        >
                          View all <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                      <Card>
                        <RecentEmails
                          limit={5}
                          showCategories={true}
                          autoRefresh={true}
                          showActions={true}
                          groupByTimePeriod={true}
                        />
                      </Card>
                    </div>

                    {/* Email Calendar */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">Upcoming Email-Related Events</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => changeSection('calendar')}
                        >
                          View calendar <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                      <Card className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer border border-dashed">
                            <div className="flex-shrink-0 h-10 w-10 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">Weekly Newsletter</p>
                                <Badge variant="outline" className="text-xs">
                                  Scheduled
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer border border-dashed">
                            <div className="flex-shrink-0 h-10 w-10 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center">
                              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">Team Meeting Follow-up</p>
                                <Badge variant="outline" className="text-xs">
                                  Draft
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">Friday, 3:30 PM</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="inbox" className="m-0 border-0">
                  <RecentEmails
                    initialFilters={{ category: 'primary' }}
                    limit={50}
                    showActions={true}
                    groupByTimePeriod={true}
                    className="px-0"
                  />
                </TabsContent>
              </CardContent>

              <CardFooter className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-t border-blue-100 dark:border-blue-900 py-2.5 px-4 justify-between items-center">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    Showing <span className="font-medium">50</span> of{' '}
                    <span className="font-medium">176</span> emails
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                  </Button>
                </div>
              </CardFooter>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
