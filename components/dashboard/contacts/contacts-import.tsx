'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import { useToast } from '@/components/ui/sonner';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  FileSpreadsheet,
  Mail,
  Database,
  FileText,
  CheckCircle,
  Cloud,
  AlertTriangle,
  ChevronLeft,
} from 'lucide-react';
import { useApolloIntegration } from '@/hooks/use-apollo-integration';

// Map import source to appropriate icon
const sourceIcons = {
  file: FileSpreadsheet,
  csv: FileSpreadsheet,
  excel: FileSpreadsheet,
  apollo: Database,
  gmail: Mail,
  outlook: Mail,
  hubspot: Database,
  salesforce: Database,
};

export function ContactsImport() {
  const [activeTab, setActiveTab] = useState<string>('file');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [importSource, setImportSource] = useState<string>('');
  const [apolloDomain, setApolloDomain] = useState<string>('');
  const [importResults, setImportResults] = useState<{
    total: number;
    imported: number;
    errors: number;
    skipped: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { searchApolloContacts } = useApolloIntegration();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImportSource(e.target.files[0].name);
    }
  };

  // Simulate progress updates during upload
  const simulateProgress = useCallback(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // Handle file upload and import
  const handleFileImport = async () => {
    if (!file) return;

    setIsUploading(true);
    const cleanupProgress = simulateProgress();

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Call the API to import contacts
      const response = await fetch('/api/contacts/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Show success message
      toast({
        title: 'Contacts imported successfully',
        description: `Imported ${result.imported} contacts from ${file.name}`,
      });

      // Set import results for display
      setImportResults({
        total: result.total,
        imported: result.imported,
        errors: result.errors,
        skipped: result.skipped,
      });

      // Reset file input
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      cleanupProgress();
      setProgress(100);
      // Keep showing 100% for a moment before resetting
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 1000);
    }
  };

  // Handle Apollo.io import
  const handleApolloImport = async () => {
    if (!apolloDomain) return;

    setIsUploading(true);
    const cleanupProgress = simulateProgress();

    try {
      // Search Apollo for the domain
      const persons = await searchApolloContacts(apolloDomain, 'domain');

      if (!persons || persons.length === 0) {
        toast({
          title: 'No contacts found',
          description: `No contacts found for domain ${apolloDomain}`,
          variant: 'destructive',
        });
        return;
      }

      // Import the contacts found in Apollo
      const response = await fetch('/api/contacts/import/apollo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ persons, domain: apolloDomain }),
      });

      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Show success message
      toast({
        title: 'Contacts imported successfully',
        description: `Imported ${result.imported} contacts from Apollo.io for ${apolloDomain}`,
      });

      // Set import results for display
      setImportResults({
        total: result.total,
        imported: result.imported,
        errors: result.errors,
        skipped: result.skipped,
      });

      // Reset input
      setApolloDomain('');
    } catch (error) {
      console.error('Apollo import error:', error);
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      cleanupProgress();
      setProgress(100);
      // Keep showing 100% for a moment before resetting
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Import Contacts</h2>
          <p className="text-muted-foreground">Add contacts from various sources</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/contacts')}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Contacts
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="cursor-pointer"
                />
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

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading and processing...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {importResults && (
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <h3 className="font-medium">Import Complete</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Total Processed:</div>
                    <div>{importResults.total}</div>
                    <div>Successfully Imported:</div>
                    <div className="text-green-600">{importResults.imported}</div>
                    <div>Skipped (Duplicates):</div>
                    <div className="text-amber-600">{importResults.skipped}</div>
                    <div>Errors:</div>
                    <div className="text-red-600">{importResults.errors}</div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push('/dashboard/contacts')}>
                Cancel
              </Button>
              <Button onClick={handleFileImport} disabled={!file || isUploading}>
                {isUploading ? (
                  <>Processing...</>
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
                <Button
                  variant="outline"
                  className="h-28 flex flex-col items-center justify-center gap-2"
                >
                  <Mail className="h-8 w-8 text-primary" />
                  <span>Google Contacts</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-28 flex flex-col items-center justify-center gap-2"
                >
                  <Mail className="h-8 w-8 text-primary" />
                  <span>Microsoft Outlook</span>
                </Button>
              </div>
              <div className="mt-4 p-3 border rounded bg-muted/50">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <p className="text-sm">
                    Email provider integration is coming soon. Please use file import for now.
                  </p>
                </div>
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
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-medium">Apollo.io Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Enter a company domain to pull contacts from Apollo.io
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="example.com"
                    value={apolloDomain}
                    onChange={e => setApolloDomain(e.target.value)}
                  />
                  <Button onClick={handleApolloImport} disabled={!apolloDomain || isUploading}>
                    {isUploading ? 'Importing...' : 'Import'}
                  </Button>
                </div>

                {isUploading && activeTab === 'service' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fetching contacts from Apollo.io...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <Button
                  variant="outline"
                  className="h-28 flex flex-col items-center justify-center gap-2"
                >
                  <Database className="h-8 w-8 text-primary" />
                  <span>Salesforce</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-28 flex flex-col items-center justify-center gap-2"
                >
                  <Database className="h-8 w-8 text-primary" />
                  <span>HubSpot</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-28 flex flex-col items-center justify-center gap-2"
                >
                  <Cloud className="h-8 w-8 text-primary" />
                  <span>LinkedIn</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
