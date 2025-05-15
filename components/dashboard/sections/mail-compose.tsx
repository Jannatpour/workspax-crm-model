'use client';
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Send,
  Clock,
  ChevronDown,
  Paperclip,
  X,
  SaveAll,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Image,
  Link,
  Type,
  ListOrdered,
  ListChecks,
  Table,
  Components,
  Template,
  Heading,
  Palette,
  FileIcon,
  Trash2,
  FolderSearch,
  Users,
  Sparkles,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Mock templates data
const mockTemplates = [
  {
    id: '1',
    name: 'Welcome Email',
    thumbnail: '/templates/welcome.png',
    category: 'Onboarding',
    description: 'Send to new contacts to welcome them to your service.',
  },
  {
    id: '2',
    name: 'Monthly Newsletter',
    thumbnail: '/templates/newsletter.png',
    category: 'Newsletter',
    description: 'Keep your audience updated with your latest news and updates.',
  },
  {
    id: '3',
    name: 'Product Announcement',
    thumbnail: '/templates/product.png',
    category: 'Marketing',
    description: 'Announce new products or features to your contacts.',
  },
  {
    id: '4',
    name: 'Follow-up Email',
    thumbnail: '/templates/followup.png',
    category: 'Sales',
    description: 'Follow up with contacts after a meeting or call.',
  },
  {
    id: '5',
    name: 'Thank You Email',
    thumbnail: '/templates/thankyou.png',
    category: 'Relationship',
    description: 'Express gratitude to your contacts for their business or support.',
  },
];

// Drag and drop email builder components
const DraggableComponent = ({ type, icon: Icon, label }) => {
  return (
    <div
      className="flex items-center gap-2 p-2 rounded-md border cursor-move hover:bg-muted/50 transition-colors"
      draggable
    >
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-sm">{label}</span>
    </div>
  );
};

// Template category component
const TemplateCategory = ({ category, templates, onSelect }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">{category}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {templates
          .filter(t => t.category === category)
          .map(template => (
            <div
              key={template.id}
              className="border rounded-md overflow-hidden cursor-pointer hover:border-primary transition-colors"
              onClick={() => onSelect(template)}
            >
              <div className="bg-muted/30 h-28 flex items-center justify-center">
                <Template className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="p-2">
                <h4 className="text-sm font-medium truncate">{template.name}</h4>
                <p className="text-xs text-muted-foreground truncate">{template.description}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

// Email template builder component
const EmailTemplateBuilder = ({ initialContent = '', onSave }) => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('components');
  const editorRef = useRef(null);

  const components = [
    { type: 'heading', icon: Heading, label: 'Heading' },
    { type: 'text', icon: Type, label: 'Text Block' },
    { type: 'image', icon: Image, label: 'Image' },
    { type: 'button', icon: Components, label: 'Button' },
    { type: 'divider', icon: PanelLeftClose, label: 'Divider' },
    { type: 'spacer', icon: PanelLeftOpen, label: 'Spacer' },
    { type: 'list', icon: ListOrdered, label: 'List' },
    { type: 'table', icon: Table, label: 'Table' },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-[calc(100vh-14rem)] border rounded-md overflow-hidden">
        {/* Sidebar for components and styles */}
        {showSidebar && (
          <div className="w-64 border-r flex flex-col">
            <div className="p-2 border-b">
              <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="components">Components</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                  <TabsTrigger value="styles">Styles</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3 space-y-4">
                {activeTab === 'components' && (
                  <>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Content Blocks</h3>
                      <div className="grid gap-2">
                        {components.map(component => (
                          <DraggableComponent
                            key={component.type}
                            type={component.type}
                            icon={component.icon}
                            label={component.label}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Layout</h3>
                      <div className="grid gap-2">
                        <DraggableComponent type="1-column" icon={PanelLeftOpen} label="1 Column" />
                        <DraggableComponent type="2-column" icon={Components} label="2 Columns" />
                        <DraggableComponent type="3-column" icon={Components} label="3 Columns" />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'templates' && (
                  <div className="space-y-6">
                    {Array.from(new Set(mockTemplates.map(t => t.category))).map(category => (
                      <TemplateCategory
                        key={category}
                        category={category}
                        templates={mockTemplates}
                        onSelect={template => console.log('Selected template:', template)}
                      />
                    ))}
                  </div>
                )}

                {activeTab === 'styles' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Colors</h3>
                      <div className="grid grid-cols-6 gap-2">
                        {['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'].map(
                          color => (
                            <div
                              key={color}
                              className="w-6 h-6 rounded-full cursor-pointer hover:ring-2 ring-offset-2 ring-offset-background transition-all"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          )
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Typography</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Font Family</span>
                          <Select defaultValue="Arial">
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue placeholder="Select font" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Arial">Arial</SelectItem>
                              <SelectItem value="Helvetica">Helvetica</SelectItem>
                              <SelectItem value="Times">Times New Roman</SelectItem>
                              <SelectItem value="Georgia">Georgia</SelectItem>
                              <SelectItem value="Verdana">Verdana</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">Font Size</span>
                          <Select defaultValue="16">
                            <SelectTrigger className="w-[80px] h-8">
                              <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent>
                              {[12, 14, 16, 18, 20, 24, 28, 32].map(size => (
                                <SelectItem key={size} value={size.toString()}>
                                  {size}px
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Background</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {['#FFFFFF', '#F3F4F6', '#FEF3C7', '#DBEAFE', '#DCFCE7', '#FEE2E2'].map(
                          color => (
                            <div
                              key={color}
                              className="h-10 rounded-md cursor-pointer hover:ring-2 ring-offset-2 transition-all flex items-center justify-center text-xs"
                              style={{ backgroundColor: color }}
                              title={color}
                            >
                              {color}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setShowSidebar(false)}
              >
                <PanelLeftClose className="h-4 w-4 mr-2" />
                Hide Sidebar
              </Button>
            </div>
          </div>
        )}

        {/* Email content editor */}
        <div className="flex-1 flex flex-col">
          {!showSidebar && (
            <div className="p-2 border-b">
              <Button variant="ghost" size="sm" onClick={() => setShowSidebar(true)}>
                <PanelLeftOpen className="h-4 w-4 mr-2" />
                Show Sidebar
              </Button>
            </div>
          )}

          <div className="flex-1 p-4 bg-slate-50 overflow-auto flex justify-center">
            <div
              className="w-full max-w-xl min-h-full bg-white shadow-sm rounded-md p-6"
              ref={editorRef}
            >
              <div className="prose max-w-none">
                <h1
                  contentEditable
                  suppressContentEditableWarning
                  className="outline-none border-none focus:ring-0"
                >
                  Email Subject Goes Here
                </h1>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  className="outline-none border-none focus:ring-0"
                >
                  Dear recipient,
                </p>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  className="outline-none border-none focus:ring-0"
                >
                  This is where the email content will go. You can drag and drop components from the
                  sidebar to build your email.
                </p>
                <div className="border rounded-md p-4 my-4">
                  <h2
                    contentEditable
                    suppressContentEditableWarning
                    className="outline-none border-none focus:ring-0"
                  >
                    Section Heading
                  </h2>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className="outline-none border-none focus:ring-0"
                  >
                    This is a content section. You can add more sections as needed.
                  </p>
                  <div className="flex justify-center mt-4">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Call to Action
                    </button>
                  </div>
                </div>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  className="outline-none border-none focus:ring-0"
                >
                  Best regards,
                  <br />
                  Your Name
                </p>
              </div>
            </div>
          </div>

          <div className="p-2 border-t flex justify-between items-center">
            <div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSave && onSave(editorRef.current?.innerHTML || '')}
              >
                <SaveAll className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Palette className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button size="sm">
                <SaveAll className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

// Main compose email component
export function MailComposeSection() {
  const { changeSection } = useDashboard();
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const fileInputRef = useRef(null);

  // Handle file attachment
  const handleAttachFile = e => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file, // Store the actual file object
      }));

      setAttachments([...attachments, ...newFiles]);
    }
  };

  // Format file size for display
  const formatFileSize = bytes => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Handle removing an attachment
  const handleRemoveAttachment = id => {
    setAttachments(attachments.filter(attachment => attachment.id !== id));
  };

  // Handle applying a template to the current email
  const handleApplyTemplate = htmlContent => {
    setMessage(htmlContent);
    setShowTemplateBuilder(false);
  };

  // Handle sending email
  const handleSendEmail = () => {
    // In a real app, this would send the email via AWS SES
    console.log('Sending email:', { to, cc, bcc, subject, message, attachments });

    // Navigate back to inbox after send
    changeSection('mail-inbox');
  };

  // Handle scheduling email
  const handleScheduleEmail = () => {
    // In a real app, this would schedule the email for sending later
    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    console.log('Scheduling email for:', scheduledDateTime, {
      to,
      cc,
      bcc,
      subject,
      message,
      attachments,
    });

    // Navigate back to inbox after scheduling
    setShowScheduleDialog(false);
    changeSection('mail-inbox');
  };

  // Handle saving as draft
  const handleSaveAsDraft = () => {
    // In a real app, this would save the email as a draft
    console.log('Saving as draft:', { to, cc, bcc, subject, message, attachments });

    // Navigate to drafts after saving
    changeSection('mail-drafts');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Compose Email</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveAsDraft}>
            <SaveAll className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>

          <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Email</DialogTitle>
                <DialogDescription>Choose when you want this email to be sent</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-date">Date</Label>
                    <Input
                      id="schedule-date"
                      type="date"
                      value={scheduleDate}
                      onChange={e => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedule-time">Time</Label>
                    <Input
                      id="schedule-time"
                      type="time"
                      value={scheduleTime}
                      onChange={e => setScheduleTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Your email will be sent automatically at the scheduled time.</p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleScheduleEmail} disabled={!scheduleDate || !scheduleTime}>
                  Schedule Send
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={handleSendEmail}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>

      {showTemplateBuilder ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Email Template Builder</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setShowTemplateBuilder(false)}>
                <X className="h-4 w-4 mr-2" />
                Exit Builder
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <EmailTemplateBuilder initialContent={message} onSave={handleApplyTemplate} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowTemplateBuilder(true)}>
                <Template className="h-4 w-4 mr-2" />
                Use Template Builder
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="to" className="w-16">
                  To:
                </Label>
                <div className="relative flex-1">
                  <Input
                    id="to"
                    placeholder="Enter recipient email address"
                    value={to}
                    onChange={e => setTo(e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    title="Select contacts"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="cc" className="w-16">
                  Cc:
                </Label>
                <Input
                  id="cc"
                  placeholder="Enter CC email addresses"
                  value={cc}
                  onChange={e => setCc(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="bcc" className="w-16">
                  Bcc:
                </Label>
                <Input
                  id="bcc"
                  placeholder="Enter BCC email addresses"
                  value={bcc}
                  onChange={e => setBcc(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="subject" className="w-16">
                  Subject:
                </Label>
                <Input
                  id="subject"
                  placeholder="Enter email subject"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </div>

              <div className="border rounded-md">
                <div className="border-b p-2 flex items-center gap-2 bg-muted/30">
                  <Button variant="ghost" size="icon" title="Text formatting">
                    <Type className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Insert link">
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Insert image">
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="List">
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Checklist">
                    <ListChecks className="h-4 w-4" />
                  </Button>
                  <div className="flex-1"></div>
                  <Button variant="ghost" size="sm" onClick={() => setShowTemplateBuilder(true)}>
                    <Template className="h-4 w-4 mr-2" />
                    Template
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Compose
                  </Button>
                </div>
                <Textarea
                  id="message"
                  className="min-h-[300px] border-none resize-none"
                  placeholder="Compose your email here..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>

              {/* Attachments section */}
              {attachments.length > 0 && (
                <div className="border rounded-md p-3 space-y-2">
                  <h3 className="text-sm font-medium mb-2">Attachments</h3>
                  <div className="space-y-2">
                    {attachments.map(attachment => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between bg-muted/30 rounded-md p-2"
                      >
                        <div className="flex items-center gap-2">
                          <FileIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(attachment.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  className="hidden"
                  onChange={handleAttachFile}
                  ref={fileInputRef}
                />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach Files
                </Button>

                <div className="flex-1"></div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      More Options
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowTemplateBuilder(true)}>
                      <Template className="h-4 w-4 mr-2" />
                      Use Template
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FolderSearch className="h-4 w-4 mr-2" />
                      From Google Drive
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSaveAsDraft}>
                      <SaveAll className="h-4 w-4 mr-2" />
                      Save as Draft
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => {
                        setTo('');
                        setCc('');
                        setBcc('');
                        setSubject('');
                        setMessage('');
                        setAttachments([]);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Discard
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Clock className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </DialogTrigger>
                </Dialog>

                <Button onClick={handleSendEmail}>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
