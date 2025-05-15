// 'use client';
// import React, { useState, useCallback } from 'react';
// import { useDashboard } from '@/context/dashboard-context';
// import { useToast } from '@/components/ui/sonner';
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardFooter,
// } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import {
//   ChevronRight,
//   LayoutDashboard,
//   Mail,
//   Users,
//   Calendar,
//   Clock,
//   CheckCircle2,
//   Bot,
//   BrainCircuit,
//   Zap,
//   BarChart2,
//   PieChart,
//   LineChart,
//   TrendingUp,
//   ArrowRight,
//   Plus,
//   Bell,
//   Search,
//   Sparkles,
//   Filter,
//   ArrowUpDown,
//   FileText,
//   BookOpen,
//   MessageSquareText,
// } from 'lucide-react';

// // Import section previews
// import { EmailStats } from '@/components/dashboard/email-stats';
// import { RecentEmails } from '@/components/dashboard/recent-emails';
// import { ContactsOverview } from '@/components/dashboard/contacts-overview';
// import { CalendarView } from '@/components/dashboard/calendar-view';
// import { UpcomingTasks } from '@/components/dashboard/upcoming-tasks';

// export function DashboardOverview() {
//   const { changeSection } = useDashboard();
//   const { toast } = useToast();
//   const [loadingSection, setLoadingSection] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');

//   // Handle section change with loading state
//   const handleSectionChange = (section: string) => {
//     setLoadingSection(section);
//     setTimeout(() => {
//       changeSection(section);
//       setLoadingSection(null);
//     }, 300); // Simulate a brief loading transition
//   };

//   // Handle search input change
//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value);
//   };

//   return (
//     <div className="container mx-auto p-4 md:p-6 space-y-6">
//       {/* Dashboard Header */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//         <div>
//           <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
//             <LayoutDashboard className="h-8 w-8 text-primary" />
//             Dashboard
//           </h2>
//           <p className="text-muted-foreground">Welcome to your WorkspaxCRM dashboard</p>
//         </div>
//         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
//           <div className="relative">
//             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search dashboard..."
//               className="pl-8 w-full sm:w-60"
//               value={searchQuery}
//               onChange={handleSearchChange}
//             />
//           </div>
//           <div className="flex items-center gap-2">
//             <Button
//               variant="outline"
//               size="icon"
//               className="relative"
//               onClick={() => handleSectionChange('notifications')}
//             >
//               <Bell className="h-4 w-4" />
//               <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
//                 3
//               </span>
//             </Button>
//             <Button
//               variant="default"
//               className="gap-1 w-full sm:w-auto"
//               onClick={() => handleSectionChange('create-task')}
//             >
//               <Plus className="h-4 w-4" />
//               New Task
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Quick Stats with improved styling */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
//         <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-gray-900 overflow-hidden border-blue-100 dark:border-blue-900">
//           <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
//           <CardContent className="p-4 flex items-center gap-4">
//             <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
//               <Mail className="h-6 w-6 text-blue-600 dark:text-blue-300" />
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Unread Emails</p>
//               <h3 className="text-2xl font-bold">24</h3>
//               <p className="text-xs text-green-600 dark:text-green-400 mt-1">+12% from last week</p>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-gray-900 overflow-hidden border-green-100 dark:border-green-900">
//           <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
//           <CardContent className="p-4 flex items-center gap-4">
//             <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
//               <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-300" />
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Completed Tasks</p>
//               <h3 className="text-2xl font-bold">18</h3>
//               <p className="text-xs text-green-600 dark:text-green-400 mt-1">4 tasks today</p>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-gray-900 overflow-hidden border-purple-100 dark:border-purple-900">
//           <div className="absolute top-0 left-0 w-2 h-full bg-purple-500"></div>
//           <CardContent className="p-4 flex items-center gap-4">
//             <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-3">
//               <Users className="h-6 w-6 text-purple-600 dark:text-purple-300" />
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Active Contacts</p>
//               <h3 className="text-2xl font-bold">543</h3>
//               <p className="text-xs text-green-600 dark:text-green-400 mt-1">12 new this month</p>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950 dark:to-gray-900 overflow-hidden border-amber-100 dark:border-amber-900">
//           <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
//           <CardContent className="p-4 flex items-center gap-4">
//             <div className="bg-amber-100 dark:bg-amber-900 rounded-full p-3">
//               <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-300" />
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Engagement</p>
//               <h3 className="text-2xl font-bold">+12%</h3>
//               <p className="text-xs text-green-600 dark:text-green-400 mt-1">Above target</p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Email Section Preview */}
//       <section className="space-y-2">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <div className="bg-blue-100 dark:bg-blue-900 p-1.5 rounded-md">
//               <Mail className="h-4 w-4 text-blue-600 dark:text-blue-300" />
//             </div>
//             <h3 className="text-xl font-semibold">Email Activity</h3>
//           </div>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => handleSectionChange('mail-inbox')}
//             disabled={loadingSection === 'mail-inbox'}
//             className="gap-1"
//           >
//             {loadingSection === 'mail-inbox' ? (
//               <span className="animate-pulse">Loading...</span>
//             ) : (
//               <>
//                 View All <ChevronRight className="h-4 w-4" />
//               </>
//             )}
//           </Button>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <Card className="overflow-hidden border-blue-100 dark:border-blue-900">
//             <CardHeader className="pb-2 bg-blue-50 dark:bg-blue-950 border-b border-blue-100 dark:border-blue-900">
//               <CardTitle className="text-base flex items-center gap-2">
//                 <BarChart2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
//                 Email Analytics
//               </CardTitle>
//               <CardDescription>Tracking your communication patterns</CardDescription>
//             </CardHeader>
//             <CardContent className="p-0">
//               <div className="h-64">
//                 <EmailStats />
//               </div>
//             </CardContent>
//             <CardFooter className="bg-blue-50 dark:bg-blue-950 border-t border-blue-100 dark:border-blue-900 py-2 px-4">
//               <p className="text-xs text-muted-foreground">Last updated: Today at 9:32 AM</p>
//             </CardFooter>
//           </Card>
//           <Card className="overflow-hidden border-blue-100 dark:border-blue-900">
//             <CardHeader className="pb-2 bg-blue-50 dark:bg-blue-950 border-b border-blue-100 dark:border-blue-900">
//               <CardTitle className="text-base flex items-center gap-2">
//                 <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
//                 Recent Communications
//               </CardTitle>
//               <CardDescription>Your latest email interactions</CardDescription>
//             </CardHeader>
//             <CardContent className="p-0">
//               <ScrollArea className="h-64">
//                 <RecentEmails limit={4} showCategories={false} />
//               </ScrollArea>
//             </CardContent>
//             <CardFooter className="bg-blue-50 dark:bg-blue-950 border-t border-blue-100 dark:border-blue-900 py-2 px-4 flex justify-between items-center">
//               <p className="text-xs text-muted-foreground">24 unread messages</p>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="h-7 text-xs"
//                 onClick={() => handleSectionChange('mail-compose')}
//               >
//                 Compose New
//               </Button>
//             </CardFooter>
//           </Card>
//         </div>
//       </section>

//       {/* Contacts and Calendar Row */}
//       <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
//         {/* Contacts Section Preview */}
//         <Card className="lg:col-span-3 overflow-hidden border-purple-100 dark:border-purple-900">
//           <CardHeader className="pb-2 bg-purple-50 dark:bg-purple-950 border-b border-purple-100 dark:border-purple-900">
//             <div className="flex items-center justify-between">
//               <CardTitle className="text-base flex items-center gap-2">
//                 <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
//                 Contacts Overview
//               </CardTitle>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => handleSectionChange('contacts')}
//                 className="h-8"
//               >
//                 View All <ChevronRight className="h-4 w-4 ml-1" />
//               </Button>
//             </div>
//             <CardDescription>Distribution of your network</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="h-64">
//               <ContactsOverview showDetailedMetrics={false} />
//             </div>
//           </CardContent>
//           <CardFooter className="bg-purple-50 dark:bg-purple-950 border-t border-purple-100 dark:border-purple-900 py-2 px-4 flex justify-between items-center">
//             <p className="text-xs text-muted-foreground">543 total contacts</p>
//             <Button
//               variant="ghost"
//               size="sm"
//               className="h-7 text-xs gap-1"
//               onClick={() => handleSectionChange('contacts-add')}
//             >
//               <Plus className="h-3 w-3" /> Add Contact
//             </Button>
//           </CardFooter>
//         </Card>

//         {/* Calendar Preview */}
//         <Card className="lg:col-span-2 overflow-hidden border-green-100 dark:border-green-900">
//           <CardHeader className="pb-2 bg-green-50 dark:bg-green-950 border-b border-green-100 dark:border-green-900">
//             <div className="flex items-center justify-between">
//               <CardTitle className="text-base flex items-center gap-2">
//                 <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
//                 Your Schedule
//               </CardTitle>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => handleSectionChange('calendar')}
//                 className="h-8"
//               >
//                 Full Calendar <ChevronRight className="h-4 w-4 ml-1" />
//               </Button>
//             </div>
//             <CardDescription>Upcoming meetings and events</CardDescription>
//           </CardHeader>
//           <CardContent className="p-0">
//             <div className="h-64 overflow-hidden">
//               <CalendarView />
//             </div>
//           </CardContent>
//           <CardFooter className="bg-green-50 dark:bg-green-950 border-t border-green-100 dark:border-green-900 py-2 px-4 flex justify-between items-center">
//             <p className="text-xs text-muted-foreground">3 events today</p>
//             <Button
//               variant="ghost"
//               size="sm"
//               className="h-7 text-xs gap-1"
//               onClick={() => handleSectionChange('calendar-create')}
//             >
//               <Plus className="h-3 w-3" /> Add Event
//             </Button>
//           </CardFooter>
//         </Card>
//       </div>

//       {/* Tasks and AI Agents Row */}
//       <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
//         {/* Tasks Preview */}
//         <Card className="lg:col-span-2 overflow-hidden border-amber-100 dark:border-amber-900">
//           <CardHeader className="pb-2 bg-amber-50 dark:bg-amber-950 border-b border-amber-100 dark:border-amber-900">
//             <div className="flex items-center justify-between">
//               <CardTitle className="text-base flex items-center gap-2">
//                 <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
//                 Upcoming Tasks
//               </CardTitle>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => handleSectionChange('tasks')}
//                 className="h-8"
//               >
//                 All Tasks <ChevronRight className="h-4 w-4 ml-1" />
//               </Button>
//             </div>
//             <CardDescription>Your prioritized to-do list</CardDescription>
//           </CardHeader>
//           <CardContent className="p-0">
//             <ScrollArea className="h-64">
//               <div className="p-4">
//                 <UpcomingTasks limit={5} />
//               </div>
//             </ScrollArea>
//           </CardContent>
//           <CardFooter className="bg-amber-50 dark:bg-amber-950 border-t border-amber-100 dark:border-amber-900 py-2 px-4 flex justify-between items-center">
//             <div className="flex items-center gap-2">
//               <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
//                 18 Done
//               </Badge>
//               <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
//                 7 Pending
//               </Badge>
//             </div>
//             <Button
//               variant="ghost"
//               size="sm"
//               className="h-7 text-xs gap-1"
//               onClick={() => handleSectionChange('tasks-create')}
//             >
//               <Plus className="h-3 w-3" /> Add Task
//             </Button>
//           </CardFooter>
//         </Card>

//         {/* AI Agents Preview */}
//         <Card className="lg:col-span-3 overflow-hidden border-indigo-100 dark:border-indigo-900">
//           <CardHeader className="pb-2 bg-indigo-50 dark:bg-indigo-950 border-b border-indigo-100 dark:border-indigo-900">
//             <div className="flex items-center justify-between">
//               <CardTitle className="text-base flex items-center gap-2">
//                 <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
//                 AI Assistant Network
//               </CardTitle>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => handleSectionChange('agents')}
//                 className="h-8"
//               >
//                 Manage Agents <ChevronRight className="h-4 w-4 ml-1" />
//               </Button>
//             </div>
//             <CardDescription>Your AI-powered workflow assistants</CardDescription>
//           </CardHeader>
//           <CardContent className="py-4 px-0">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4">
//               <div className="border rounded-lg p-4 flex items-center gap-3 bg-white dark:bg-gray-950 hover:shadow-md transition-shadow">
//                 <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full p-2.5">
//                   <BrainCircuit className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
//                 </div>
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2">
//                     <p className="font-medium">Email Assistant</p>
//                     <Badge
//                       variant="secondary"
//                       className="text-xs px-1.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
//                     >
//                       Active
//                     </Badge>
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-1">Processing 2 tasks</p>
//                   <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
//                     <div
//                       className="bg-indigo-500 h-full rounded-full"
//                       style={{ width: '75%' }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>

//               <div className="border rounded-lg p-4 flex items-center gap-3 bg-white dark:bg-gray-950 hover:shadow-md transition-shadow">
//                 <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2.5">
//                   <Zap className="h-5 w-5 text-blue-600 dark:text-blue-300" />
//                 </div>
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2">
//                     <p className="font-medium">Lead Qualifier</p>
//                     <Badge
//                       variant="secondary"
//                       className="text-xs px-1.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
//                     >
//                       Active
//                     </Badge>
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-1">12 leads qualified</p>
//                   <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
//                     <div className="bg-blue-500 h-full rounded-full" style={{ width: '65%' }}></div>
//                   </div>
//                 </div>
//               </div>

//               <div className="border rounded-lg p-4 flex items-center gap-3 bg-white dark:bg-gray-950 hover:shadow-md transition-shadow">
//                 <div className="bg-amber-100 dark:bg-amber-900 rounded-full p-2.5">
//                   <BarChart2 className="h-5 w-5 text-amber-600 dark:text-amber-300" />
//                 </div>
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2">
//                     <p className="font-medium">Analytics Bot</p>
//                     <Badge
//                       variant="secondary"
//                       className="text-xs px-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
//                     >
//                       Idle
//                     </Badge>
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-1">Last report: 2h ago</p>
//                   <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
//                     <div
//                       className="bg-amber-500 h-full rounded-full"
//                       style={{ width: '100%' }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>

//               <div className="border rounded-lg p-4 flex items-center gap-3 bg-white dark:bg-gray-950 hover:shadow-md transition-shadow">
//                 <div className="bg-green-100 dark:bg-green-900 rounded-full p-2.5">
//                   <MessageSquareText className="h-5 w-5 text-green-600 dark:text-green-300" />
//                 </div>
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2">
//                     <p className="font-medium">Auto Responder</p>
//                     <Badge
//                       variant="secondary"
//                       className="text-xs px-1.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
//                     >
//                       Active
//                     </Badge>
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-1">42 responses sent today</p>
//                   <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
//                     <div
//                       className="bg-green-500 h-full rounded-full"
//                       style={{ width: '85%' }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-4 flex justify-center px-4">
//               <Button
//                 className="w-full sm:w-auto gap-1"
//                 onClick={() => handleSectionChange('agents-create')}
//               >
//                 <Plus className="h-4 w-4" />
//                 Create New Agent
//               </Button>
//             </div>
//           </CardContent>
//           <CardFooter className="bg-indigo-50 dark:bg-indigo-950 border-t border-indigo-100 dark:border-indigo-900 py-2 px-4 flex justify-between items-center">
//             <p className="text-xs text-muted-foreground">4 agents active, 1 idle</p>
//             <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
//               AI credits: 780
//             </Badge>
//           </CardFooter>
//         </Card>
//       </div>

//       {/* Quick Access Footer */}
//       <div className="mt-8 border rounded-xl p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
//         <h4 className="text-sm font-medium mb-3 ml-2 flex items-center gap-2">
//           <Sparkles className="h-4 w-4 text-amber-500" />
//           Quick Access
//         </h4>
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
//           <Button
//             variant="outline"
//             className="h-auto py-4 flex-col gap-2 hover:shadow-md hover:border-primary/40 transition-all"
//             onClick={() => handleSectionChange('mail-inbox')}
//           >
//             <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//             <span className="text-xs">Inbox</span>
//           </Button>
//           <Button
//             variant="outline"
//             className="h-auto py-4 flex-col gap-2 hover:shadow-md hover:border-primary/40 transition-all"
//             onClick={() => handleSectionChange('contacts')}
//           >
//             <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
//             <span className="text-xs">Contacts</span>
//           </Button>
//           <Button
//             variant="outline"
//             className="h-auto py-4 flex-col gap-2 hover:shadow-md hover:border-primary/40 transition-all"
//             onClick={() => handleSectionChange('templates')}
//           >
//             <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
//             <span className="text-xs">Templates</span>
//           </Button>
//           <Button
//             variant="outline"
//             className="h-auto py-4 flex-col gap-2 hover:shadow-md hover:border-primary/40 transition-all"
//             onClick={() => handleSectionChange('calendar')}
//           >
//             <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
//             <span className="text-xs">Calendar</span>
//           </Button>
//           <Button
//             variant="outline"
//             className="h-auto py-4 flex-col gap-2 hover:shadow-md hover:border-primary/40 transition-all"
//             onClick={() => handleSectionChange('stats')}
//           >
//             <BarChart2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
//             <span className="text-xs">Analytics</span>
//           </Button>
//           <Button
//             variant="outline"
//             className="h-auto py-4 flex-col gap-2 hover:shadow-md hover:border-primary/40 transition-all"
//             onClick={() => handleSectionChange('knowledge')}
//           >
//             <BookOpen className="h-5 w-5 text-red-600 dark:text-red-400" />
//             <span className="text-xs">Knowledge</span>
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';
import React, { useState, useCallback } from 'react';
import { useDashboard } from '@/context/dashboard-context';
import { useToast } from '@/components/ui/sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ChevronRight,
  LayoutDashboard,
  Mail,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  Bot,
  BrainCircuit,
  Zap,
  BarChart2,
  PieChart,
  LineChart,
  TrendingUp,
  ArrowRight,
  Plus,
  Bell,
  Search,
  Sparkles,
  Filter,
  ArrowUpDown,
  FileText,
  BookOpen,
  MessageSquareText,
  Eye,
  MousePointer,
  AlertCircle,
  MessageCircle,
  PenSquare,
  BarChart3,
  CalendarClock,
  Inbox,
  MoveRight,
  TrendingDown,
} from 'lucide-react';

// Import section previews
import { EmailStats } from '@/components/dashboard/email-stats';
import { RecentEmails } from '@/components/dashboard/recent-emails';
import { ContactsOverview } from '@/components/dashboard/contacts-overview';
import { CalendarView } from '@/components/dashboard/calendar-view';
import { UpcomingTasks } from '@/components/dashboard/upcoming-tasks';

export function DashboardOverview() {
  const { changeSection } = useDashboard();
  const { toast } = useToast();
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle section change with loading state
  const handleSectionChange = (section: string) => {
    setLoadingSection(section);
    setTimeout(() => {
      changeSection(section);
      setLoadingSection(null);
    }, 300); // Simulate a brief loading transition
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Dashboard
          </h2>
          <p className="text-muted-foreground">Welcome to your WorkspaxCRM dashboard</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dashboard..."
              className="pl-8 w-full sm:w-60"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="relative"
              onClick={() => handleSectionChange('notifications')}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                3
              </span>
            </Button>
            <Button
              variant="default"
              className="gap-1 w-full sm:w-auto"
              onClick={() => handleSectionChange('create-task')}
            >
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats with improved styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-gray-900 overflow-hidden border-blue-100 dark:border-blue-900">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unread Emails</p>
              <h3 className="text-2xl font-bold">24</h3>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">+12% from last week</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-gray-900 overflow-hidden border-green-100 dark:border-green-900">
          <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Tasks</p>
              <h3 className="text-2xl font-bold">18</h3>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">4 tasks today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-gray-900 overflow-hidden border-purple-100 dark:border-purple-900">
          <div className="absolute top-0 left-0 w-2 h-full bg-purple-500"></div>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-3">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Contacts</p>
              <h3 className="text-2xl font-bold">543</h3>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">12 new this month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950 dark:to-gray-900 overflow-hidden border-amber-100 dark:border-amber-900">
          <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-amber-100 dark:bg-amber-900 rounded-full p-3">
              <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Engagement</p>
              <h3 className="text-2xl font-bold">+12%</h3>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Above target</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Activity Section - Redesigned */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-md">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Email Activity</h3>
              <p className="text-xs text-muted-foreground">
                Communication trends & recent messages
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSectionChange('mail-inbox')}
            disabled={loadingSection === 'mail-inbox'}
            className="gap-1"
          >
            {loadingSection === 'mail-inbox' ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              <>
                View All <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email Performance Card */}
          <Card className="overflow-hidden border-blue-100 dark:border-blue-900">
            <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b border-blue-100 dark:border-blue-900">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Email Performance
                </CardTitle>
                <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                  Last 7 days
                </Badge>
              </div>
              <CardDescription>Key metrics and engagement analytics</CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <div className="grid grid-cols-2 gap-0 h-64">
                {/* Open Rate */}
                <div className="p-5 border-r border-b border-dashed border-blue-100 dark:border-blue-900 flex flex-col justify-center items-center text-center">
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-full p-2 mb-2">
                    <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Open Rate</p>
                  <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400">46.0%</h3>
                  <div className="flex items-center text-xs mt-1 text-green-600 dark:text-green-400">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>5.2% vs previous period</span>
                  </div>
                </div>

                {/* Click Rate */}
                <div className="p-5 border-b border-dashed border-blue-100 dark:border-blue-900 flex flex-col justify-center items-center text-center">
                  <div className="bg-indigo-50 dark:bg-indigo-950 rounded-full p-2 mb-2">
                    <MousePointer className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Click Rate</p>
                  <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">20.0%</h3>
                  <div className="flex items-center text-xs mt-1 text-green-600 dark:text-green-400">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>3.1% vs previous period</span>
                  </div>
                </div>

                {/* Bounce Rate */}
                <div className="p-5 border-r border-dashed border-blue-100 dark:border-blue-900 flex flex-col justify-center items-center text-center">
                  <div className="bg-red-50 dark:bg-red-950 rounded-full p-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Bounce Rate</p>
                  <h3 className="text-3xl font-bold text-red-500 dark:text-red-400">1.8%</h3>
                  <div className="flex items-center text-xs mt-1 text-green-600 dark:text-green-400">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    <span>1.2% vs previous period</span>
                  </div>
                </div>

                {/* Response Time */}
                <div className="p-5 flex flex-col justify-center items-center text-center">
                  <div className="bg-green-50 dark:bg-green-950 rounded-full p-2 mb-2">
                    <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Response Time</p>
                  <h3 className="text-3xl font-bold text-green-600 dark:text-green-400">42 min</h3>
                  <div className="flex items-center text-xs mt-1 text-amber-600 dark:text-amber-400">
                    <MoveRight className="h-3 w-3 mr-1" />
                    <span>Avg. time to reply</span>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-t border-blue-100 dark:border-blue-900 py-2.5 px-4 justify-between items-center">
              <div className="flex items-center gap-1">
                <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Updated: Today at 9:32 AM</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => handleSectionChange('email-analytics')}
              >
                <BarChart3 className="h-3.5 w-3.5" /> Detailed Analytics
              </Button>
            </CardFooter>
          </Card>

          {/* Recent Communications Card */}
          <Card className="overflow-hidden border-blue-100 dark:border-blue-900">
            <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b border-blue-100 dark:border-blue-900">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Recent Communications
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 bg-white/50 dark:bg-gray-800/50 gap-1 text-xs"
                  onClick={() => handleSectionChange('mail-compose')}
                >
                  <PenSquare className="h-3.5 w-3.5" /> Compose
                </Button>
              </div>
              <CardDescription>Your latest email interactions</CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-64">
                <div className="divide-y divide-blue-100 dark:divide-blue-900">
                  {/* Message Item 1 */}
                  <div className="p-3 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                        <span className="font-medium text-indigo-600 dark:text-indigo-300">JD</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">John Doe</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            10:42 AM
                          </span>
                        </div>
                        <p className="text-sm truncate">Meeting follow-up: Q2 Marketing Plan</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="h-5 px-1 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          >
                            Work
                          </Badge>
                          <p className="text-xs text-muted-foreground truncate">
                            Thanks for the presentation yesterday...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Item 2 */}
                  <div className="p-3 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                        <span className="font-medium text-green-600 dark:text-green-300">AS</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">Alex Smith</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            Yesterday
                          </span>
                        </div>
                        <p className="text-sm truncate">Updated proposal for client review</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="h-5 px-1 text-xs bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                          >
                            Client
                          </Badge>
                          <p className="text-xs text-muted-foreground truncate">
                            I've attached the final version of...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Item 3 */}
                  <div className="p-3 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                        <span className="font-medium text-purple-600 dark:text-purple-300">LJ</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">Lisa Johnson</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            Tuesday
                          </span>
                        </div>
                        <p className="text-sm truncate">Team sync: Project Milestone Updates</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="h-5 px-1 text-xs bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                          >
                            Team
                          </Badge>
                          <p className="text-xs text-muted-foreground truncate">
                            Let's review our progress on...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Item 4 */}
                  <div className="p-3 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                        <span className="font-medium text-red-600 dark:text-red-300">TB</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">Tom Brown</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            Monday
                          </span>
                        </div>
                        <p className="text-sm truncate">Quarterly Budget Review - Action Items</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="h-5 px-1 text-xs bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800"
                          >
                            Urgent
                          </Badge>
                          <p className="text-xs text-muted-foreground truncate">
                            Can you address the following points...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>

            <CardFooter className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-t border-blue-100 dark:border-blue-900 py-2.5 px-4 justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  24 unread
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  15 sent today
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => handleSectionChange('mail-inbox')}
              >
                <Inbox className="h-3.5 w-3.5" /> View Inbox
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Contacts and Calendar Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Contacts Section Preview */}
        <Card className="lg:col-span-3 overflow-hidden border-purple-100 dark:border-purple-900">
          <CardHeader className="pb-2 bg-purple-50 dark:bg-purple-950 border-b border-purple-100 dark:border-purple-900">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Contacts Overview
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSectionChange('contacts')}
                className="h-8"
              >
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <CardDescription>Distribution of your network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ContactsOverview showDetailedMetrics={false} />
            </div>
          </CardContent>
          <CardFooter className="bg-purple-50 dark:bg-purple-950 border-t border-purple-100 dark:border-purple-900 py-2 px-4 flex justify-between items-center">
            <p className="text-xs text-muted-foreground">543 total contacts</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => handleSectionChange('contacts-add')}
            >
              <Plus className="h-3 w-3" /> Add Contact
            </Button>
          </CardFooter>
        </Card>

        {/* Calendar Preview */}
        <Card className="lg:col-span-2 overflow-hidden border-green-100 dark:border-green-900">
          <CardHeader className="pb-2 bg-green-50 dark:bg-green-950 border-b border-green-100 dark:border-green-900">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                Your Schedule
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSectionChange('calendar')}
                className="h-8"
              >
                Full Calendar <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <CardDescription>Upcoming meetings and events</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-64 overflow-hidden">
              <CalendarView />
            </div>
          </CardContent>
          <CardFooter className="bg-green-50 dark:bg-green-950 border-t border-green-100 dark:border-green-900 py-2 px-4 flex justify-between items-center">
            <p className="text-xs text-muted-foreground">3 events today</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => handleSectionChange('calendar-create')}
            >
              <Plus className="h-3 w-3" /> Add Event
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Tasks and AI Agents Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Tasks Preview */}
        <Card className="lg:col-span-2 overflow-hidden border-amber-100 dark:border-amber-900">
          <CardHeader className="pb-2 bg-amber-50 dark:bg-amber-950 border-b border-amber-100 dark:border-amber-900">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                Upcoming Tasks
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSectionChange('tasks')}
                className="h-8"
              >
                All Tasks <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <CardDescription>Your prioritized to-do list</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              <div className="p-4">
                <UpcomingTasks limit={5} />
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="bg-amber-50 dark:bg-amber-950 border-t border-amber-100 dark:border-amber-900 py-2 px-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                18 Done
              </Badge>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                7 Pending
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => handleSectionChange('tasks-create')}
            >
              <Plus className="h-3 w-3" /> Add Task
            </Button>
          </CardFooter>
        </Card>

        {/* AI Agents Preview */}
        <Card className="lg:col-span-3 overflow-hidden border-indigo-100 dark:border-indigo-900">
          <CardHeader className="pb-2 bg-indigo-50 dark:bg-indigo-950 border-b border-indigo-100 dark:border-indigo-900">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                AI Assistant Network
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSectionChange('agents')}
                className="h-8"
              >
                Manage Agents <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <CardDescription>Your AI-powered workflow assistants</CardDescription>
          </CardHeader>
          <CardContent className="py-4 px-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4">
              <div className="border rounded-lg p-4 flex items-center gap-3 bg-white dark:bg-gray-950 hover:shadow-md transition-shadow">
                <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full p-2.5">
                  <BrainCircuit className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Email Assistant</p>
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    >
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Processing 2 tasks</p>
                  <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 flex items-center gap-3 bg-white dark:bg-gray-950 hover:shadow-md transition-shadow">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2.5">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Lead Qualifier</p>
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    >
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">12 leads qualified</p>
                  <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 flex items-center gap-3 bg-white dark:bg-gray-950 hover:shadow-md transition-shadow">
                <div className="bg-amber-100 dark:bg-amber-900 rounded-full p-2.5">
                  <BarChart2 className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Analytics Bot</p>
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    >
                      Idle
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Last report: 2h ago</p>
                  <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 flex items-center gap-3 bg-white dark:bg-gray-950 hover:shadow-md transition-shadow">
                <div className="bg-green-100 dark:bg-green-900 rounded-full p-2.5">
                  <MessageSquareText className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Auto Responder</p>
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    >
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">42 responses sent today</p>
                  <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full"
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-center px-4">
              <Button
                className="w-full sm:w-auto gap-1"
                onClick={() => handleSectionChange('agents-create')}
              >
                <Plus className="h-4 w-4" />
                Create New Agent
              </Button>
            </div>
          </CardContent>
          <CardFooter className="bg-indigo-50 dark:bg-indigo-950 border-t border-indigo-100 dark:border-indigo-900 py-2 px-4 flex justify-between items-center">
            <p className="text-xs text-muted-foreground">4 agents active, 1 idle</p>
            <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
              AI credits: 780
            </Badge>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Access Footer */}
      <div className="mt-8 border rounded-xl p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <h4 className="text-sm font-medium mb-3 ml-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Quick Access
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2 hover:shadow-md hover:border-primary/40 transition-all"
            onClick={() => handleSectionChange('mail-inbox')}
          >
            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs">Inbox</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2 hover:shadow-md hover:border-primary/40 transition-all"
            onClick={() => handleSectionChange('contacts')}
          >
            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs">Contacts</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2 hover:shadow-md hover:border-primary/40 transition-all"
            onClick={() => handleSectionChange('templates')}
          >
            <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs">Templates</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2 hover:shadow-md hover:border-primary/40 transition-all"
            onClick={() => handleSectionChange('calendar')}
          >
            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-xs">Calendar</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2 hover:shadow-md hover:border-primary/40 transition-all"
            onClick={() => handleSectionChange('stats')}
          >
            <BarChart2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs">Analytics</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2 hover:shadow-md hover:border-primary/40 transition-all"
            onClick={() => handleSectionChange('knowledge')}
          >
            <BookOpen className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="text-xs">Knowledge</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
