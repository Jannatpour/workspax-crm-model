// components/mail/mail-compose.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from '@/components/ui/menubar';
import {
  Send,
  Save,
  Trash2,
  MoreHorizontal,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Image,
  Paperclip,
  Timer,
  Calendar,
  LayoutTemplate,
  Check,
  Edit,
  Eye,
  X,
  ChevronDown,
  Loader2,
  Plus,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

// Template selector component
const TemplateSelector = ({ onSelect }: { onSelect: (content: string) => void }) => {
  const templates = [
    { id: '1', name: 'Welcome Email', content: 'Dear [Name],\n\nWelcome to our platform...' },
    {
      id: '2',
      name: 'Follow-up Meeting',
      content: 'Hi [Name],\n\nFollowing our meeting yesterday...',
    },
    {
      id: '3',
      name: 'Sales Proposal',
      content: 'Dear [Name],\n\nThank you for your interest in our services...',
    },
  ];

  return (
    <div className="grid gap-2">
      <h3 className="text-sm font-medium">Select a Template</h3>
      <div className="grid gap-2">
        {templates.map(template => (
          <Button
            key={template.id}
            variant="outline"
            className="justify-start"
            onClick={() => onSelect(template.content)}
          >
            <LayoutTemplate className="mr-2 h-4 w-4" />
            {template.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

// Schedule options component
const ScheduleOptions = ({ onSchedule }: { onSchedule: (date: Date) => void }) => {
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');

  const handleSchedule = () => {
    const scheduledDate = new Date(`${date}T${time}`);
    onSchedule(scheduledDate);
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="schedule-date">Date</Label>
        <Input
          id="schedule-date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="schedule-time">Time</Label>
        <Input
          id="schedule-time"
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
        />
      </div>
      <Button onClick={handleSchedule} disabled={!date || !time}>
        <Calendar className="mr-2 h-4 w-4" />
        Schedule Send
      </Button>
    </div>
  );
};

export function MailCompose() {
  const { changeSection } = useDashboard();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showScheduleOptions, setShowScheduleOptions] = useState(false);
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('compose');
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  // Text formatting states
  const [textFormat, setTextFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
    Strikethrough: false,
  });

  // Text alignment state
  const [textAlignment, setTextAlignment] = useState('left');

  // List options state
  const [listOptions, setListOptions] = useState({
    bulletList: false,
    numberedList: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  // Insert link
  const insertLink = () => {
    const url = prompt('Enter URL:');
    const text = prompt('Enter link text:');
    if (url && text) {
      const linkText = `[${text}](${url})`;
      setContent(prev => prev + linkText);
    }
  };

  // Insert image
  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const imageText = `![Image](${url})`;
      setContent(prev => prev + imageText);
    }
  };

  // Trigger file input click
  const triggerAttachmentInput = () => {
    fileInputRef.current?.click();
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle text formatting
  const toggleTextFormat = (format: keyof typeof textFormat) => {
    setTextFormat(prev => ({
      ...prev,
      [format]: !prev[format],
    }));
  };

  // Set text alignment
  const setAlignment = (alignment: string) => {
    setTextAlignment(alignment);
  };

  // Toggle list option
  const toggleListOption = (option: keyof typeof listOptions) => {
    setListOptions(prev => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  // Apply template
  const applyTemplate = (templateContent: string) => {
    setContent(templateContent);
    setShowTemplateSelector(false);
    toast.success('Template applied', {
      description: 'The template has been applied to your email',
    });
  };

  // Schedule email
  const scheduleEmail = (date: Date) => {
    setScheduledTime(date);
    setShowScheduleOptions(false);
    toast.success('Email scheduled', {
      description: `Your email will be sent on ${date.toLocaleString()}`,
    });
  };

  // Send email
  const sendEmail = () => {
    if (!to) {
      toast.error('Recipient required', {
        description: 'Please specify at least one recipient',
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Email sent', {
        description: 'Your email has been sent successfully',
      });

      // Return to inbox
      changeSection('mail-inbox');
    }, 1500);
  };

  // Save as draft
  const saveDraft = () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Draft saved', {
        description: 'Your email has been saved as a draft',
      });

      // Return to drafts
      changeSection('mail-drafts');
    }, 1000);
  };

  // Discard email
  const discardEmail = () => {
    setShowConfirmDiscard(false);

    // Return to inbox
    changeSection('mail-inbox');

    toast.success('Email discarded', {
      description: 'Your email has been discarded',
    });
  };

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Compose Email</CardTitle>
            <div className="flex items-center gap-2">
              {scheduledTime && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Timer className="h-4 w-4 mr-1" />
                  Scheduled: {scheduledTime.toLocaleString()}
                </div>
              )}
              <Button variant="ghost" size="icon" onClick={() => setShowConfirmDiscard(true)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Main tabs for compose/preview */}
          <Tabs
            defaultValue="compose"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="compose">
                <Edit className="h-4 w-4 mr-2" />
                Compose
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-4">
              {/* Email form */}
              <div className="grid gap-4">
                {/* Recipients */}
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="to">To</Label>
                    <div className="flex gap-2">
                      {!showCc && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => setShowCc(true)}
                        >
                          Add Cc
                        </Button>
                      )}
                      {!showBcc && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => setShowBcc(true)}
                        >
                          Add Bcc
                        </Button>
                      )}
                    </div>
                  </div>
                  <Input
                    id="to"
                    placeholder="recipient@example.com"
                    value={to}
                    onChange={e => setTo(e.target.value)}
                  />
                </div>

                {/* Cc */}
                {showCc && (
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="cc">Cc</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => setShowCc(false)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                    <Input
                      id="cc"
                      placeholder="cc@example.com"
                      value={cc}
                      onChange={e => setCc(e.target.value)}
                    />
                  </div>
                )}

                {/* Bcc */}
                {showBcc && (
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="bcc">Bcc</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => setShowBcc(false)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                    <Input
                      id="bcc"
                      placeholder="bcc@example.com"
                      value={bcc}
                      onChange={e => setBcc(e.target.value)}
                    />
                  </div>
                )}

                {/* Subject */}
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Subject"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                  />
                </div>

                {/* Rich text editor menubar */}
                <Menubar className="border rounded-md">
                  {/* Text formatting menu */}
                  <MenubarMenu>
                    <MenubarTrigger className="font-medium">Format</MenubarTrigger>
                    <MenubarContent>
                      <MenubarCheckboxItem
                        checked={textFormat.bold}
                        onCheckedChange={() => toggleTextFormat('bold')}
                      >
                        <Bold className="h-4 w-4 mr-2" />
                        Bold
                        <MenubarShortcut>⌘B</MenubarShortcut>
                      </MenubarCheckboxItem>
                      <MenubarCheckboxItem
                        checked={textFormat.italic}
                        onCheckedChange={() => toggleTextFormat('italic')}
                      >
                        <Italic className="h-4 w-4 mr-2" />
                        Italic
                        <MenubarShortcut>⌘I</MenubarShortcut>
                      </MenubarCheckboxItem>
                      <MenubarCheckboxItem
                        checked={textFormat.underline}
                        onCheckedChange={() => toggleTextFormat('underline')}
                      >
                        <Underline className="h-4 w-4 mr-2" />
                        Underline
                        <MenubarShortcut>⌘U</MenubarShortcut>
                      </MenubarCheckboxItem>
                      <MenubarCheckboxItem
                        checked={textFormat.Strikethrough}
                        onCheckedChange={() => toggleTextFormat('Strikethrough')}
                      >
                        <Strikethrough className="h-4 w-4 mr-2" />
                        Strikethrough
                      </MenubarCheckboxItem>
                    </MenubarContent>
                  </MenubarMenu>

                  {/* Alignment menu */}
                  <MenubarMenu>
                    <MenubarTrigger className="font-medium">Align</MenubarTrigger>
                    <MenubarContent>
                      <MenubarRadioGroup value={textAlignment} onValueChange={setAlignment}>
                        <MenubarRadioItem value="left">
                          <AlignLeft className="h-4 w-4 mr-2" />
                          Left
                        </MenubarRadioItem>
                        <MenubarRadioItem value="center">
                          <AlignCenter className="h-4 w-4 mr-2" />
                          Center
                        </MenubarRadioItem>
                        <MenubarRadioItem value="right">
                          <AlignRight className="h-4 w-4 mr-2" />
                          Right
                        </MenubarRadioItem>
                        <MenubarRadioItem value="justify">
                          <AlignJustify className="h-4 w-4 mr-2" />
                          Justify
                        </MenubarRadioItem>
                      </MenubarRadioGroup>
                    </MenubarContent>
                  </MenubarMenu>

                  {/* List options menu */}
                  <MenubarMenu>
                    <MenubarTrigger className="font-medium">List</MenubarTrigger>
                    <MenubarContent>
                      <MenubarCheckboxItem
                        checked={listOptions.bulletList}
                        onCheckedChange={() => toggleListOption('bulletList')}
                      >
                        <List className="h-4 w-4 mr-2" />
                        Bullet List
                      </MenubarCheckboxItem>
                      <MenubarCheckboxItem
                        checked={listOptions.numberedList}
                        onCheckedChange={() => toggleListOption('numberedList')}
                      >
                        <ListOrdered className="h-4 w-4 mr-2" />
                        Numbered List
                      </MenubarCheckboxItem>
                    </MenubarContent>
                  </MenubarMenu>

                  {/* Insert menu */}
                  <MenubarMenu>
                    <MenubarTrigger className="font-medium">Insert</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem onClick={insertLink}>
                        <Link className="h-4 w-4 mr-2" />
                        Link
                        <MenubarShortcut>⌘K</MenubarShortcut>
                      </MenubarItem>
                      <MenubarItem onClick={insertImage}>
                        <Image className="h-4 w-4 mr-2" />
                        Image
                      </MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem onClick={triggerAttachmentInput}>
                        <Paperclip className="h-4 w-4 mr-2" />
                        Attachment
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>

                  {/* View menu */}
                  <MenubarMenu>
                    <MenubarTrigger className="font-medium">View</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem onClick={() => setActiveTab('compose')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Compose
                      </MenubarItem>
                      <MenubarItem onClick={() => setActiveTab('preview')}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>

                {/* Content */}
                <Textarea
                  id="content"
                  placeholder="Write your email here..."
                  className={cn(
                    'min-h-[200px]',
                    textFormat.bold && 'font-bold',
                    textFormat.italic && 'italic',
                    textFormat.underline && 'underline',
                    textFormat.Strikethrough && 'line-through',
                    `text-${textAlignment}`
                  )}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />

                {/* Hidden file input for attachments */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />

                {/* Attachments */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Attachments</Label>
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded-md"
                        >
                          <div className="flex items-center">
                            <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({Math.round(file.size / 1024)} KB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Template selector */}
                {showTemplateSelector && (
                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Templates</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setShowTemplateSelector(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <TemplateSelector onSelect={applyTemplate} />
                  </div>
                )}

                {/* Schedule options */}
                {showScheduleOptions && (
                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Schedule Email</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setShowScheduleOptions(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <ScheduleOptions onSchedule={scheduleEmail} />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {/* Email preview */}
              <div className="p-4 border rounded-md">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">To: {to}</p>
                    {cc && <p className="text-sm text-muted-foreground">Cc: {cc}</p>}
                    {bcc && <p className="text-sm text-muted-foreground">Bcc: {bcc}</p>}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{subject || '(No subject)'}</h2>
                  </div>
                  <div className="min-h-[200px] prose prose-sm max-w-none">
                    {content ? (
                      <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />
                    ) : (
                      <p className="text-muted-foreground italic">(No content)</p>
                    )}
                  </div>
                  {attachments.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Attachments ({attachments.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center p-2 border rounded-md text-sm"
                          >
                            <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                            {file.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex gap-2">
            <Button onClick={sendEmail} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => setShowScheduleOptions(true)}>
                  <Timer className="mr-2 h-4 w-4" />
                  Schedule send
                </DropdownMenuItem>
                <DropdownMenuItem onClick={saveDraft}>
                  <Save className="mr-2 h-4 w-4" />
                  Save as draft
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowTemplateSelector(true)}>
                  <LayoutTemplate className="mr-2 h-4 w-4" />
                  Use template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="mr-2 h-4 w-4" />
                  Attach files
                </DropdownMenuItem>
                <Input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowConfirmDiscard(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Discard
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Secondary action buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={saveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Confirm discard dialog */}
      <Dialog open={showConfirmDiscard} onOpenChange={setShowConfirmDiscard}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard Email</DialogTitle>
            <DialogDescription>
              Are you sure you want to discard this email? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDiscard(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={discardEmail}>
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Import the Eye component which was missing in the components list
function Eye(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
