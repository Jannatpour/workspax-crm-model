// 'use client';

// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { RecentEmails } from '@/components/dashboard/recent-emails';
// import { ContactsOverview } from '@/components/dashboard/contacts-overview';
// import { CalendarView } from '@/components/dashboard/calendar-view';
// import { UpcomingTasks } from '@/components/dashboard/upcoming-tasks';
// import { EmailStats } from '@/components/dashboard/email-stats';
// import { useTheme } from 'next-themes';

// export default function DashboardPage() {
//   const [activeSection, setActiveSection] = useState('email');
//   const [mounted, setMounted] = useState(false);
//   const { theme, setTheme } = useTheme();

//   // Fix for hydration mismatch - only show theme UI after component mounts
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   return (
//     <div className="flex h-screen overflow-hidden">
//       {/* Sidebar */}
//       <div className="hidden w-64 flex-shrink-0 flex-col bg-gray-100 dark:bg-gray-800 md:flex">
//         <div className="flex h-14 items-center justify-between px-4 border-b">
//           <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">WorkspaxCRM</h1>

//           {/* Theme toggle */}
//           {mounted && (
//             <button
//               onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
//               className="rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
//               aria-label="Toggle theme"
//             >
//               {theme === 'dark' ? (
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <circle cx="12" cy="12" r="5"></circle>
//                   <line x1="12" y1="1" x2="12" y2="3"></line>
//                   <line x1="12" y1="21" x2="12" y2="23"></line>
//                   <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
//                   <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
//                   <line x1="1" y1="12" x2="3" y2="12"></line>
//                   <line x1="21" y1="12" x2="23" y2="12"></line>
//                   <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
//                   <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
//                 </svg>
//               ) : (
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
//                 </svg>
//               )}
//             </button>
//           )}
//         </div>
//         <nav className="flex-1 overflow-y-auto p-2">
//           <ul className="space-y-1">
//             {/* Sidebar navigation items */}
//             <SidebarCategory title="Main" />
//             <SidebarItem
//               active={activeSection === 'email'}
//               icon="mail"
//               label="Email"
//               onClick={() => setActiveSection('email')}
//               submenu={[
//                 { label: 'Inbox', onClick: () => console.log('Inbox') },
//                 { label: 'Sent', onClick: () => console.log('Sent') },
//                 { label: 'Drafts', onClick: () => console.log('Drafts') },
//                 { label: 'Compose', onClick: () => console.log('Compose') },
//               ]}
//             />
//             <SidebarItem
//               active={activeSection === 'contacts'}
//               icon="users"
//               label="Contacts"
//               onClick={() => setActiveSection('contacts')}
//               submenu={[
//                 { label: 'All Contacts', onClick: () => console.log('All Contacts') },
//                 { label: 'Groups', onClick: () => console.log('Groups') },
//                 { label: 'Add Contact', onClick: () => console.log('Add Contact') },
//               ]}
//             />
//             <SidebarItem
//               active={activeSection === 'calendar'}
//               icon="calendar"
//               label="Calendar"
//               onClick={() => setActiveSection('calendar')}
//             />
//             <SidebarItem
//               active={activeSection === 'campaigns'}
//               icon="zap"
//               label="Campaigns"
//               onClick={() => setActiveSection('campaigns')}
//             />

//             <SidebarCategory title="Analytics" />
//             <SidebarItem
//               active={activeSection === 'analytics'}
//               icon="bar-chart"
//               label="Analytics"
//               onClick={() => setActiveSection('analytics')}
//             />
//             <SidebarItem
//               active={activeSection === 'reports'}
//               icon="file-text"
//               label="Reports"
//               onClick={() => setActiveSection('reports')}
//             />
//             <SidebarItem
//               active={activeSection === 'notifications'}
//               icon="bell"
//               label="Notifications"
//               onClick={() => setActiveSection('notifications')}
//             />
//           </ul>
//         </nav>
//       </div>

//       {/* Main content area */}
//       <div className="flex flex-1 flex-col overflow-hidden">
//         {/* Top header */}
//         <header className="flex h-14 items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 bg-white dark:bg-gray-800">
//           <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
//             {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
//           </h2>

//           {/* Header actions */}
//           <div className="flex items-center space-x-2">
//             <button className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-6 w-6"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
//                 />
//               </svg>
//             </button>
//             {/* Mobile theme toggle */}
//             {mounted && (
//               <button
//                 className="md:hidden rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
//                 onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
//               >
//                 {theme === 'dark' ? (
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-6 w-6"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <circle cx="12" cy="12" r="5"></circle>
//                     <line x1="12" y1="1" x2="12" y2="3"></line>
//                     <line x1="12" y1="21" x2="12" y2="23"></line>
//                     <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
//                     <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
//                     <line x1="1" y1="12" x2="3" y2="12"></line>
//                     <line x1="21" y1="12" x2="23" y2="12"></line>
//                     <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
//                     <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
//                   </svg>
//                 ) : (
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-6 w-6"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
//                   </svg>
//                 )}
//               </button>
//             )}
//             <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
//           </div>
//         </header>

//         {/* Main content with conditional rendering based on active section */}
//         <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
//           {/* EMAIL SECTION */}
//           {activeSection === 'email' && (
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//                 <MetricCard
//                   title="Total Emails"
//                   value="145"
//                   change="+12.5%"
//                   period="from last month"
//                   icon="mail"
//                 />
//                 <MetricCard
//                   title="Open Rate"
//                   value="68.2%"
//                   change="+2.3%"
//                   period="from last month"
//                   icon="eye"
//                 />
//                 <MetricCard
//                   title="Response Rate"
//                   value="42.8%"
//                   change="+5.1%"
//                   period="from last month"
//                   icon="message-square"
//                 />
//                 <MetricCard
//                   title="Avg. Response Time"
//                   value="2.4h"
//                   change="-0.3h"
//                   period="from last month"
//                   icon="clock"
//                 />
//               </div>

//               {/* Email Related Tabs */}
//               <Tabs defaultValue="overview" className="w-full">
//                 <TabsList className="mb-6 w-full justify-start">
//                   <TabsTrigger value="overview">Overview</TabsTrigger>
//                   <TabsTrigger value="inbox">Inbox</TabsTrigger>
//                   <TabsTrigger value="sent">Sent</TabsTrigger>
//                   <TabsTrigger value="drafts">Drafts</TabsTrigger>
//                   <TabsTrigger value="trash">Trash</TabsTrigger>
//                 </TabsList>

//                 {/* Overview Content */}
//                 <TabsContent value="overview">
//                   <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//                     <Card className="bg-white dark:bg-gray-800">
//                       <CardHeader>
//                         <CardTitle className="text-gray-900 dark:text-white">
//                           Email Activity
//                         </CardTitle>
//                         <CardDescription className="text-gray-500 dark:text-gray-400">
//                           Your email sending and response patterns over time
//                         </CardDescription>
//                       </CardHeader>
//                       <CardContent>
//                         <div className="h-80">
//                           <EmailStats />
//                         </div>
//                       </CardContent>
//                     </Card>

//                     <Card className="bg-white dark:bg-gray-800">
//                       <CardHeader>
//                         <CardTitle className="text-gray-900 dark:text-white">
//                           Recent Emails
//                         </CardTitle>
//                         <CardDescription className="text-gray-500 dark:text-gray-400">
//                           Your most recent email conversations
//                         </CardDescription>
//                       </CardHeader>
//                       <CardContent>
//                         <div className="h-80 overflow-auto">
//                           <RecentEmails />
//                         </div>
//                       </CardContent>
//                     </Card>
//                   </div>
//                 </TabsContent>

//                 {/* Other Email Tabs Content */}
//                 <TabsContent value="inbox">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">Inbox</CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Manage your incoming emails
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96 overflow-auto">
//                       <RecentEmails />
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="sent">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">Sent</CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         View your sent emails
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Your sent emails will appear here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="drafts">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">Drafts</CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Manage your email drafts
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Your draft emails will appear here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="trash">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">Trash</CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         View and recover deleted emails
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Your deleted emails will appear here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               </Tabs>
//             </div>
//           )}

//           {/* CONTACTS SECTION */}
//           {activeSection === 'contacts' && (
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//                 <MetricCard
//                   title="Total Contacts"
//                   value="423"
//                   change="+18.1%"
//                   period="from last month"
//                   icon="users"
//                 />
//                 <MetricCard
//                   title="New Contacts"
//                   value="64"
//                   change=""
//                   period="Last 30 days"
//                   icon="user-plus"
//                 />
//                 <MetricCard
//                   title="Active Contacts"
//                   value="289"
//                   change=""
//                   period="68% of total"
//                   icon="user-check"
//                 />
//                 <MetricCard
//                   title="Contact Groups"
//                   value="12"
//                   change="+3"
//                   period="from last month"
//                   icon="folder"
//                 />
//               </div>

//               {/* Contact Tabs */}
//               <Tabs defaultValue="all" className="w-full">
//                 <TabsList className="mb-6 w-full justify-start">
//                   <TabsTrigger value="all">All Contacts</TabsTrigger>
//                   <TabsTrigger value="groups">Groups</TabsTrigger>
//                   <TabsTrigger value="recent">Recent</TabsTrigger>
//                   <TabsTrigger value="favorites">Favorites</TabsTrigger>
//                 </TabsList>

//                 {/* All Contacts Content */}
//                 <TabsContent value="all">
//                   <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//                     <Card className="bg-white dark:bg-gray-800">
//                       <CardHeader>
//                         <CardTitle className="text-gray-900 dark:text-white">
//                           Contacts Overview
//                         </CardTitle>
//                         <CardDescription className="text-gray-500 dark:text-gray-400">
//                           Distribution of your contacts by industry
//                         </CardDescription>
//                       </CardHeader>
//                       <CardContent>
//                         <div className="h-80">
//                           <ContactsOverview />
//                         </div>
//                       </CardContent>
//                     </Card>

//                     <Card className="bg-white dark:bg-gray-800">
//                       <CardHeader>
//                         <CardTitle className="text-gray-900 dark:text-white">
//                           Top Contacts
//                         </CardTitle>
//                         <CardDescription className="text-gray-500 dark:text-gray-400">
//                           Most engaged contacts based on recent activity
//                         </CardDescription>
//                       </CardHeader>
//                       <CardContent>
//                         <div className="h-80 overflow-auto">
//                           <p className="text-gray-500 dark:text-gray-400">
//                             Top contacts list goes here.
//                           </p>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   </div>
//                 </TabsContent>

//                 {/* Other Contact Tabs Content */}
//                 <TabsContent value="groups">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         Contact Groups
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Manage your contact groups
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Your contact groups will appear here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="recent">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         Recent Contacts
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Contacts you've recently interacted with
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Your recent contacts will appear here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="favorites">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         Favorite Contacts
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Your starred and favorite contacts
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Your favorite contacts will appear here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               </Tabs>
//             </div>
//           )}

//           {/* CALENDAR SECTION */}
//           {activeSection === 'calendar' && (
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//                 <MetricCard
//                   title="Upcoming Events"
//                   value="8"
//                   change=""
//                   period="Next 7 days"
//                   icon="calendar"
//                 />
//                 <MetricCard
//                   title="Scheduled Calls"
//                   value="5"
//                   change=""
//                   period="This week"
//                   icon="phone"
//                 />
//                 <MetricCard
//                   title="Follow-ups Due"
//                   value="12"
//                   change="+3"
//                   period="from yesterday"
//                   icon="clipboard"
//                 />
//               </div>

//               {/* Calendar Tabs */}
//               <Tabs defaultValue="month" className="w-full">
//                 <TabsList className="mb-6 w-full justify-start">
//                   <TabsTrigger value="month">Month</TabsTrigger>
//                   <TabsTrigger value="week">Week</TabsTrigger>
//                   <TabsTrigger value="day">Day</TabsTrigger>
//                   <TabsTrigger value="agenda">Agenda</TabsTrigger>
//                 </TabsList>

//                 {/* Month View Content */}
//                 <TabsContent value="month">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         Monthly Calendar
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         View your calendar by month
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="h-96">
//                         <CalendarView />
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 {/* Other Calendar Tabs Content */}
//                 <TabsContent value="week">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         Weekly Calendar
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         View your calendar by week
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Weekly calendar view goes here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="day">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         Daily Calendar
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         View your calendar by day
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Daily calendar view goes here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="agenda">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">Agenda</CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         List of upcoming events and tasks
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96 overflow-auto">
//                       <UpcomingTasks />
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               </Tabs>
//             </div>
//           )}

//           {/* CAMPAIGNS SECTION */}
//           {activeSection === 'campaigns' && (
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//                 <MetricCard
//                   title="Active Campaigns"
//                   value="3"
//                   change="+2"
//                   period="from last month"
//                   icon="zap"
//                 />
//                 <MetricCard
//                   title="Avg. Open Rate"
//                   value="59.4%"
//                   change=""
//                   period="Across all campaigns"
//                   icon="mail-open"
//                 />
//                 <MetricCard
//                   title="Click-through Rate"
//                   value="24.8%"
//                   change="+2.1%"
//                   period="from previous"
//                   icon="mouse-pointer"
//                 />
//                 <MetricCard
//                   title="Conversion Rate"
//                   value="8.6%"
//                   change="+0.8%"
//                   period="from previous"
//                   icon="trending-up"
//                 />
//               </div>

//               {/* Campaign Tabs */}
//               <Tabs defaultValue="active" className="w-full">
//                 <TabsList className="mb-6 w-full justify-start">
//                   <TabsTrigger value="active">Active</TabsTrigger>
//                   <TabsTrigger value="draft">Draft</TabsTrigger>
//                   <TabsTrigger value="completed">Completed</TabsTrigger>
//                   <TabsTrigger value="create">Create New</TabsTrigger>
//                 </TabsList>

//                 {/* Active Campaigns Content */}
//                 <TabsContent value="active">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         Active Campaigns
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Currently running email campaigns
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Active campaigns list goes here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 {/* Other Campaign Tabs Content */}
//                 <TabsContent value="draft">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         Draft Campaigns
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Campaigns in preparation
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Draft campaigns list goes here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="completed">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         Completed Campaigns
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Historical campaign performance
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Completed campaigns list goes here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="create">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         Create Campaign
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Start a new email campaign
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Campaign creation form goes here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               </Tabs>
//             </div>
//           )}

//           {/* ANALYTICS SECTION */}
//           {activeSection === 'analytics' && (
//             <div className="space-y-6">
//               <Tabs defaultValue="overview" className="w-full">
//                 <TabsList className="mb-6 w-full justify-start">
//                   <TabsTrigger value="overview">Overview</TabsTrigger>
//                   <TabsTrigger value="email">Email</TabsTrigger>
//                   <TabsTrigger value="contacts">Contacts</TabsTrigger>
//                   <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="overview">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         Analytics Overview
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Key performance metrics across all activities
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Analytics overview goes here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="email">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         Email Analytics
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Detailed email performance metrics
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">Email analytics goes here.</p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="contacts">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         Contact Analytics
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Contact growth and engagement metrics
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Contact analytics goes here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="campaigns">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         Campaign Analytics
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Campaign performance and ROI metrics
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Campaign analytics goes here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               </Tabs>
//             </div>
//           )}

//           {/* REPORTS SECTION */}
//           {activeSection === 'reports' && (
//             <div className="space-y-6">
//               <Tabs defaultValue="generate" className="w-full">
//                 <TabsList className="mb-6 w-full justify-start">
//                   <TabsTrigger value="generate">Generate Report</TabsTrigger>
//                   <TabsTrigger value="saved">Saved Reports</TabsTrigger>
//                   <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
//                   <TabsTrigger value="templates">Templates</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="generate">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         Generate Report
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Create a new custom report
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Report generation form goes here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="saved">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">Saved Reports</CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Your previously generated reports
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Saved reports list goes here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="scheduled">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         Scheduled Reports
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Reports set to generate automatically
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Scheduled reports list goes here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="templates">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         Report Templates
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Pre-configured report formats
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Report templates list goes here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               </Tabs>
//             </div>
//           )}

//           {/* NOTIFICATIONS SECTION */}
//           {activeSection === 'notifications' && (
//             <div className="space-y-6">
//               <Tabs defaultValue="all" className="w-full">
//                 <TabsList className="mb-6 w-full justify-start">
//                   <TabsTrigger value="all">All Notifications</TabsTrigger>
//                   <TabsTrigger value="unread">Unread</TabsTrigger>
//                   <TabsTrigger value="mentions">Mentions</TabsTrigger>
//                   <TabsTrigger value="settings">Settings</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="all">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         All Notifications
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         View all your notifications
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96 overflow-auto">
//                       <UpcomingTasks />
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="unread">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         Unread Notifications
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Notifications you haven't seen yet
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Unread notifications list goes here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="mentions">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">Mentions</CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Notifications that mention you directly
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">Mentions list goes here.</p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="settings">
//                   <Card className="bg-white dark:bg-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-gray-900 dark:text-white">
//                         Notification Settings
//                       </CardTitle>
//                       <CardDescription className="text-gray-500 dark:text-gray-400">
//                         Configure your notification preferences
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="h-96">
//                       <p className="text-gray-500 dark:text-gray-400">
//                         Notification settings form goes here.
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               </Tabs>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }

// // Sidebar Category Label Component
// function SidebarCategory({ title }) {
//   return (
//     <div className="px-3 pt-4 pb-1">
//       <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
//         {title}
//       </p>
//     </div>
//   );
// }

// // Sidebar Item Component
// function SidebarItem({ active, icon, label, onClick, submenu }) {
//   const [expanded, setExpanded] = useState(active);

//   const toggleSubmenu = e => {
//     if (submenu) {
//       e.stopPropagation();
//       setExpanded(!expanded);
//     }
//   };

//   return (
//     <>
//       <li>
//         <button
//           onClick={() => {
//             onClick();
//             if (submenu) setExpanded(true);
//           }}
//           className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium ${
//             active
//               ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'
//               : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
//           }`}
//         >
//           <div className="flex items-center">
//             <SidebarIcon name={icon} className="mr-2 h-4 w-4" />
//             <span>{label}</span>
//           </div>
//           {submenu && (
//             <button onClick={toggleSubmenu}>
//               <SidebarIcon
//                 name={expanded ? 'chevron-down' : 'chevron-right'}
//                 className="ml-2 h-4 w-4"
//               />
//             </button>
//           )}
//         </button>
//       </li>

//       {/* Submenu items */}
//       {submenu && expanded && (
//         <ul className="mt-1 space-y-1 pl-8">
//           {submenu.map((item, index) => (
//             <li key={index}>
//               <button
//                 onClick={item.onClick}
//                 className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
//               >
//                 {item.label}
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}
//     </>
//   );
// }

// // Metric Card Component
// function MetricCard({ title, value, change, period, icon }) {
//   return (
//     <Card className="bg-white dark:bg-gray-800">
//       <CardHeader className="flex flex-row items-center justify-between pb-2">
//         <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
//           {title}
//         </CardTitle>
//         <SidebarIcon name={icon} className="h-4 w-4 text-gray-400 dark:text-gray-500" />
//       </CardHeader>
//       <CardContent>
//         <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
//         <p className="text-xs text-gray-500 dark:text-gray-400">
//           {change && (
//             <span
//               className={`${
//                 change.startsWith('+')
//                   ? 'text-emerald-500'
//                   : change.startsWith('-')
//                   ? 'text-rose-500'
//                   : ''
//               }`}
//             >
//               {change}{' '}
//             </span>
//           )}
//           {period}
//         </p>
//       </CardContent>
//     </Card>
//   );
// }

// // Helper component for icons with additional icons
// function SidebarIcon({ name, className }) {
//   const iconPath = () => {
//     switch (name) {
//       case 'home':
//         return <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>;
//       case 'mail':
//         return (
//           <>
//             <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
//             <polyline points="22,6 12,13 2,6"></polyline>
//           </>
//         );
//       case 'mail-open':
//         return (
//           <>
//             <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"></path>
//             <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"></path>
//           </>
//         );
//       case 'users':
//         return (
//           <>
//             <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
//             <circle cx="9" cy="7" r="4"></circle>
//             <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
//             <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
//           </>
//         );
//       case 'user-plus':
//         return (
//           <>
//             <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
//             <circle cx="8.5" cy="7" r="4"></circle>
//             <line x1="20" y1="8" x2="20" y2="14"></line>
//             <line x1="23" y1="11" x2="17" y2="11"></line>
//           </>
//         );
//       case 'user-check':
//         return (
//           <>
//             <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
//             <circle cx="8.5" cy="7" r="4"></circle>
//             <polyline points="17 11 19 13 23 9"></polyline>
//           </>
//         );
//       case 'calendar':
//         return (
//           <>
//             <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
//             <line x1="16" y1="2" x2="16" y2="6"></line>
//             <line x1="8" y1="2" x2="8" y2="6"></line>
//             <line x1="3" y1="10" x2="21" y2="10"></line>
//           </>
//         );
//       case 'zap':
//         return <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>;
//       case 'bar-chart':
//         return (
//           <>
//             <line x1="18" y1="20" x2="18" y2="10"></line>
//             <line x1="12" y1="20" x2="12" y2="4"></line>
//             <line x1="6" y1="20" x2="6" y2="14"></line>
//           </>
//         );
//       case 'file-text':
//         return (
//           <>
//             <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
//             <polyline points="14 2 14 8 20 8"></polyline>
//             <line x1="16" y1="13" x2="8" y2="13"></line>
//             <line x1="16" y1="17" x2="8" y2="17"></line>
//             <polyline points="10 9 9 9 8 9"></polyline>
//           </>
//         );
//       case 'bell':
//         return (
//           <>
//             <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
//             <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
//           </>
//         );
//       case 'eye':
//         return (
//           <>
//             <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
//             <circle cx="12" cy="12" r="3"></circle>
//           </>
//         );
//       case 'message-square':
//         return <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>;
//       case 'clock':
//         return (
//           <>
//             <circle cx="12" cy="12" r="10"></circle>
//             <polyline points="12 6 12 12 16 14"></polyline>
//           </>
//         );
//       case 'phone':
//         return (
//           <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
//         );
//       case 'clipboard':
//         return (
//           <>
//             <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
//             <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
//           </>
//         );
//       case 'folder':
//         return (
//           <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
//         );
//       case 'mouse-pointer':
//         return (
//           <>
//             <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
//             <path d="M13 13l6 6"></path>
//           </>
//         );
//       case 'trending-up':
//         return (
//           <>
//             <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
//             <polyline points="17 6 23 6 23 12"></polyline>
//           </>
//         );
//       case 'chevron-down':
//         return <polyline points="6 9 12 15 18 9"></polyline>;
//       case 'chevron-right':
//         return <polyline points="9 18 15 12 9 6"></polyline>;
//       default:
//         return <path d="M12 5v14M5 12h14"></path>;
//     }
//   };

//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       className={className}
//     >
//       {iconPath()}
//     </svg>
//   );
// }
