'use client';
import React, { useState } from 'react';
import { useDashboard } from '@/context/dashboard-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/sonner';
import { Upload, FileSpreadsheet, Mail, Database } from 'lucide-react';

export function ContactsImport() {
  const { changeSection } = useDashboard();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsUploading(true);

    try {
      // Here you would call your actual import API
      // For now we'll simulate a successful import
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Contacts imported successfully',
        description: `Imported ${Math.floor(Math.random() * 100 + 20)} contacts from ${file.name}`,
      });

      // Reset file input
      setFile(null);

      // Navigate back to contacts overview
      changeSection('contacts');
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'There was an error importing your contacts.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Import Contacts</h2>
          <p className="text-muted-foreground">Add contacts from various sources</p>
        </div>
        <Button variant="outline" onClick={() => changeSection('contacts')}>
          Back to Contacts
        </Button>
      </div>

      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="file">File Upload</TabsTrigger>
          <TabsTrigger value="email">Email Provider</TabsTrigger>
          <TabsTrigger value="service">External Service</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Import from File</CardTitle>
              <CardDescription>Upload a CSV or Excel file with your contacts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="file">Contact File</Label>
                <Input id="file" type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
                <p className="text-sm text-muted-foreground">Supports CSV, Excel (.xlsx, .xls)</p>
              </div>

              {file && (
                <div className="flex items-center p-3 border rounded">
                  <FileSpreadsheet className="h-5 w-5 mr-2 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleImport} disabled={!file || isUploading}>
                {isUploading ? (
                  <>Importing...</>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Contacts
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Import from Email Provider</CardTitle>
              <CardDescription>Connect to your email provider to import contacts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <Mail className="h-8 w-8" />
                  <span>Google Contacts</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <Mail className="h-8 w-8" />
                  <span>Microsoft Outlook</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Import from External Service</CardTitle>
              <CardDescription>Connect to external services to import contacts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <Database className="h-8 w-8" />
                  <span>Apollo.io</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <Database className="h-8 w-8" />
                  <span>Salesforce</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <Database className="h-8 w-8" />
                  <span>HubSpot</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
