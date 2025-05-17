'use client';

import React, { useState } from 'react';
import { ArrowLeft, Upload, FileUp, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboard } from '@/context/dashboard-context';
import { useToast } from '@/components/ui/sonner';

export function ContactsImport() {
  const { goBack } = useDashboard();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importMethod, setImportMethod] = useState('csv');
  const [mappingFields, setMappingFields] = useState({
    firstName: 'firstName',
    lastName: 'lastName',
    email: 'email',
    phone: 'phone',
    company: 'company',
    title: 'title',
  });
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<
    'idle' | 'mapping' | 'importing' | 'complete' | 'error'
  >('idle');
  const [previewData, setPreviewData] = useState<any[]>([]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImportStatus('mapping');

    // Simulate reading file
    setTimeout(() => {
      // This would normally be a CSV/Excel parsing logic
      setPreviewData([
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '(555) 123-4567',
          company: 'Acme Inc',
          title: 'CEO',
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '(555) 765-4321',
          company: 'TechCorp',
          title: 'Marketing Director',
        },
        // More sample data...
      ]);
    }, 1000);
  };

  // Handle field mapping change
  const handleMappingChange = (field: string, value: string) => {
    setMappingFields({
      ...mappingFields,
      [field]: value,
    });
  };

  // Start import process
  const handleStartImport = () => {
    setImportStatus('importing');

    // Simulate import progress
    const interval = setInterval(() => {
      setImportProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setImportStatus('complete');
          toast({
            title: 'Import complete',
            description: `Successfully imported ${previewData.length} contacts.`,
          });
          return 100;
        }
        return newProgress;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Import Contacts</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {importStatus === 'idle' && 'Select File'}
                {importStatus === 'mapping' && 'Map Fields'}
                {importStatus === 'importing' && 'Importing...'}
                {importStatus === 'complete' && 'Import Complete'}
                {importStatus === 'error' && 'Import Error'}
              </CardTitle>
              <CardDescription>
                {importStatus === 'idle' && 'Choose a CSV or Excel file containing your contacts'}
                {importStatus === 'mapping' && 'Match the columns in your file to contact fields'}
                {importStatus === 'importing' && 'Your contacts are being imported'}
                {importStatus === 'complete' && 'Your contacts have been successfully imported'}
                {importStatus === 'error' && 'There was an error importing your contacts'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {importStatus === 'idle' && (
                <div className="space-y-4">
                  <Tabs defaultValue="csv" onValueChange={value => setImportMethod(value)}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="csv">CSV File</TabsTrigger>
                      <TabsTrigger value="excel">Excel File</TabsTrigger>
                    </TabsList>
                    <TabsContent value="csv" className="pt-4">
                      <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
                        <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">Upload CSV File</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Drag and drop your CSV file here, or click to browse
                        </p>
                        <Input
                          type="file"
                          accept=".csv"
                          className="max-w-xs"
                          onChange={handleFileChange}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="excel" className="pt-4">
                      <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
                        <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">Upload Excel File</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Drag and drop your Excel file here, or click to browse
                        </p>
                        <Input
                          type="file"
                          accept=".xlsx,.xls"
                          className="max-w-xs"
                          onChange={handleFileChange}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Tip</AlertTitle>
                    <AlertDescription>
                      Make sure your CSV file includes headers and contains at least the first name,
                      last name, and email address for each contact.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {importStatus === 'mapping' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Select
                        value={mappingFields.firstName}
                        onValueChange={value => handleMappingChange('firstName', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="firstName">firstName</SelectItem>
                          <SelectItem value="first_name">first_name</SelectItem>
                          <SelectItem value="First Name">First Name</SelectItem>
                          <SelectItem value="given_name">given_name</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Last Name</Label>
                      <Select
                        value={mappingFields.lastName}
                        onValueChange={value => handleMappingChange('lastName', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lastName">lastName</SelectItem>
                          <SelectItem value="last_name">last_name</SelectItem>
                          <SelectItem value="Last Name">Last Name</SelectItem>
                          <SelectItem value="surname">surname</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Email</Label>
                      <Select
                        value={mappingFields.email}
                        onValueChange={value => handleMappingChange('email', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">email</SelectItem>
                          <SelectItem value="email_address">email_address</SelectItem>
                          <SelectItem value="Email Address">Email Address</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Phone</Label>
                      <Select
                        value={mappingFields.phone}
                        onValueChange={value => handleMappingChange('phone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">phone</SelectItem>
                          <SelectItem value="phone_number">phone_number</SelectItem>
                          <SelectItem value="Phone Number">Phone Number</SelectItem>
                          <SelectItem value="mobile">mobile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Company</Label>
                      <Select
                        value={mappingFields.company}
                        onValueChange={value => handleMappingChange('company', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="company">company</SelectItem>
                          <SelectItem value="organization">organization</SelectItem>
                          <SelectItem value="Company Name">Company Name</SelectItem>
                          <SelectItem value="employer">employer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Job Title</Label>
                      <Select
                        value={mappingFields.title}
                        onValueChange={value => handleMappingChange('title', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="title">title</SelectItem>
                          <SelectItem value="job_title">job_title</SelectItem>
                          <SelectItem value="Job Title">Job Title</SelectItem>
                          <SelectItem value="position">position</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border rounded-md mt-6">
                    <div className="bg-muted px-4 py-2 border-b">
                      <h3 className="font-medium">Data Preview</h3>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left font-medium p-2">First Name</th>
                            <th className="text-left font-medium p-2">Last Name</th>
                            <th className="text-left font-medium p-2">Email</th>
                            <th className="text-left font-medium p-2">Phone</th>
                            <th className="text-left font-medium p-2">Company</th>
                            <th className="text-left font-medium p-2">Job Title</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.slice(0, 3).map((row, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{row.firstName}</td>
                              <td className="p-2">{row.lastName}</td>
                              <td className="p-2">{row.email}</td>
                              <td className="p-2">{row.phone}</td>
                              <td className="p-2">{row.company}</td>
                              <td className="p-2">{row.title}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {importStatus === 'importing' && (
                <div className="space-y-6">
                  <div className="text-center py-6">
                    <Upload className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                    <h3 className="text-lg font-medium mb-2">Importing Contacts</h3>
                    <p className="text-muted-foreground mb-4">
                      Please wait while we import your contacts. This may take a few moments.
                    </p>
                    <Progress value={importProgress} className="w-full h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {Math.round(importProgress)}% complete
                    </p>
                  </div>
                </div>
              )}

              {importStatus === 'complete' && (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Import Complete</h3>
                  <p className="text-muted-foreground mb-4">
                    Successfully imported {previewData.length} contacts
                  </p>
                  <Button onClick={goBack} className="mt-2">
                    Return to Contacts
                  </Button>
                </div>
              )}

              {importStatus === 'error' && (
                <div className="text-center py-6">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Import Failed</h3>
                  <p className="text-muted-foreground mb-4">
                    There was an error importing your contacts. Please try again.
                  </p>
                  <Button
                    onClick={() => setImportStatus('idle')}
                    variant="outline"
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {importStatus === 'mapping' && (
                <>
                  <Button variant="outline" onClick={() => setImportStatus('idle')}>
                    Back
                  </Button>
                  <Button onClick={handleStartImport}>Start Import</Button>
                </>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Import Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Preparing Your File</h4>
                <p className="text-sm text-muted-foreground">
                  For best results, ensure your file contains clear column headers and all required
                  information for your contacts.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Required Fields</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                  <li>First Name</li>
                  <li>Last Name</li>
                  <li>Email Address</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Recommended Fields</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                  <li>Phone Number</li>
                  <li>Company</li>
                  <li>Job Title</li>
                  <li>Address</li>
                  <li>Tags</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Avoiding Duplicates</h4>
                <p className="text-sm text-muted-foreground">
                  We automatically check for duplicate email addresses. If a contact already exists
                  with the same email, you'll have the option to update or skip it.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
