'use client';
import React from 'react';
import { useDashboard } from '../../context/dashboard-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Paperclip, ChevronDown, Loader2 } from 'lucide-react';

export function MailCompose() {
  const { changeSection } = useDashboard();
  const [isSending, setIsSending] = React.useState(false);
  const [recipients, setRecipients] = React.useState<string[]>([]);
  const [currentRecipient, setCurrentRecipient] = React.useState('');

  const handleAddRecipient = () => {
    if (currentRecipient && !recipients.includes(currentRecipient)) {
      setRecipients([...recipients, currentRecipient]);
      setCurrentRecipient('');
    }
  };

  const handleRemoveRecipient = (recipient: string) => {
    setRecipients(recipients.filter(r => r !== recipient));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRecipient();
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Go back to inbox
    setIsSending(false);
    changeSection('mail-inbox');
  };

  const handleDiscard = () => {
    changeSection('mail-inbox');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Compose Email</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Message</CardTitle>
          <CardDescription>Compose a new email message</CardDescription>
        </CardHeader>
        <form onSubmit={handleSendEmail}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md">
                {recipients.map((recipient, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
                  >
                    <span>{recipient}</span>
                    <button
                      type="button"
                      className="ml-1 text-primary/70 hover:text-primary"
                      onClick={() => handleRemoveRecipient(recipient)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <Input
                  id="to"
                  value={currentRecipient}
                  onChange={e => setCurrentRecipient(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleAddRecipient}
                  className="flex-1 min-w-[150px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Enter email addresses..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Enter subject..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Write your message here..."
                className="min-h-[200px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select defaultValue="normal">
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Button type="button" variant="outline" className="mt-2">
                <Paperclip className="h-4 w-4 mr-2" />
                Attach Files
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="ghost" onClick={handleDiscard}>
              Discard
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
              <Button type="submit" disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Email'
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
