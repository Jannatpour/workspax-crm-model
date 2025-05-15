'use client';
import React, { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Upload,
  ChevronLeft,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Users,
  RefreshCw,
  ChevronRight,
  FileText,
  Database,
  HardDrive,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// CSV File Upload and Import Component
const CSVImport = ({ onComplete }) => {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(1); // 1: Upload, 2: Map Fields, 3: Review, 4: Import
  const [progress, setProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('idle'); // idle, importing, complete, error
  const [previewData, setPreviewData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [importResults, setImportResults] = useState({
    total: 0,
    imported: 0,
    updated: 0,
    errors: 0,
  });

  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = e => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // In a real app, we would parse the CSV here to get the headers and preview data
      // For demo purposes, we'll simulate this with some mock data
      setTimeout(() => {
        setHeaders(['email', 'first_name', 'last_name', 'company', 'title', 'phone']);
        setPreviewData([
          {
            email: 'john@example.com',
            first_name: 'John',
            last_name: 'Smith',
            company: 'Acme Inc',
            title: 'CEO',
            phone: '555-1234',
          },
          {
            email: 'jane@example.com',
            first_name: 'Jane',
            last_name: 'Doe',
            company: 'Globex Corp',
            title: 'CTO',
            phone: '555-5678',
          },
          {
            email: 'bob@example.com',
            first_name: 'Bob',
            last_name: 'Johnson',
            company: 'ABC Ltd',
            title: 'Marketing Director',
            phone: '555-9012',
          },
          // Add more rows as needed
        ]);

        // Initialize field mapping with best guesses
        const initialMapping = {};
        headers.forEach(header => {
          // Simple logic to map CSV headers to contact fields
          switch (header.toLowerCase()) {
            case 'email':
            case 'email_address':
              initialMapping[header] = 'email';
              break;
            case 'first_name':
            case 'firstname':
            case 'fname':
              initialMapping[header] = 'firstName';
              break;
            case 'last_name':
            case 'lastname':
            case 'lname':
              initialMapping[header] = 'lastName';
              break;
            case 'company':
            case 'company_name':
            case 'organization':
              initialMapping[header] = 'company';
              break;
            case 'title':
            case 'job_title':
            case 'position':
              initialMapping[header] = 'title';
              break;
            case 'phone':
            case 'phone_number':
            case 'telephone':
              initialMapping[header] = 'phone';
              break;
            default:
              initialMapping[header] = '';
          }
        });

        setFieldMapping(initialMapping);
        setStep(2);
      }, 500);
    }
  };

  // Handle field mapping change
  const handleMappingChange = (csvField, contactField) => {
    setFieldMapping({
      ...fieldMapping,
      [csvField]: contactField,
    });
  };

  // Start the import process
  const handleStartImport = () => {
    setStep(4);
    setImportStatus('importing');

    // Simulate import progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setImportStatus('complete');
        setImportResults({
          total: previewData.length,
          imported: Math.floor(previewData.length * 0.7),
          updated: Math.floor(previewData.length * 0.2),
          errors: Math.floor(previewData.length * 0.1),
        });
      }
    }, 200);
  };

  // Contact field options for mapping
  const contactFields = [
    { value: 'email', label: 'Email' },
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'company', label: 'Company' },
    { value: 'title', label: 'Job Title' },
    { value: 'phone', label: 'Phone' },
    { value: 'address', label: 'Address' },
    { value: 'city', label: 'City' },
    { value: 'state', label: 'State' },
    { value: 'country', label: 'Country' },
    { value: 'website', label: 'Website' },
    { value: 'linkedinUrl', label: 'LinkedIn URL' },
    { value: 'twitterUrl', label: 'Twitter URL' },
    { value: 'tags', label: 'Tags' },
    { value: 'notes', label: 'Notes' },
    { value: '', label: 'Do Not Import' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Contacts from CSV</CardTitle>
        <CardDescription>Upload a CSV file with your contacts data</CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-6 py-4">
            <div className="border-2 border-dashed rounded-md p-8 text-center">
              <FileSpreadsheet className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload CSV File</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop a CSV file here, or click to browse
              </p>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Select CSV File
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">File Requirements</h3>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>CSV file format (.csv)</li>
                <li>First row must contain column headers</li>
                <li>File size up to 10MB</li>
                <li>Up to 5,000 contacts per import</li>
              </ul>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">Need a template?</h3>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Map CSV Fields</h3>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">File:</span> {file?.name}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Match each column from your CSV file to the appropriate contact field. Required
                fields are marked with *.
              </p>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CSV Column</TableHead>
                      <TableHead>Sample Data</TableHead>
                      <TableHead>Contact Field</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {headers.map((header, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{header}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {previewData[0]?.[header]}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={fieldMapping[header]}
                            onValueChange={value => handleMappingChange(header, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {contactFields.map(field => (
                                <SelectItem key={field.value} value={field.value}>
                                  {field.label} {field.value === 'email' ? ' *' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Review Data</h3>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Contacts to import:</span> {previewData.length}
              </div>
            </div>

            <div className="border rounded-md">
              <ScrollArea className="h-80">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(fieldMapping)
                        .filter(header => fieldMapping[header] !== '')
                        .map(header => (
                          <TableHead key={header}>
                            {contactFields.find(f => f.value === fieldMapping[header])?.label ||
                              header}
                          </TableHead>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Object.keys(fieldMapping)
                          .filter(header => fieldMapping[header] !== '')
                          .map(header => (
                            <TableCell key={`${rowIndex}-${header}`}>
                              {row[header] || '-'}
                            </TableCell>
                          ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium">Import Options</h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="update-existing" defaultChecked />
                  <Label htmlFor="update-existing">Update existing contacts if email matches</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox id="skip-duplicates" defaultChecked />
                  <Label htmlFor="skip-duplicates">Skip duplicate email addresses</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox id="add-tags" />
                  <Label htmlFor="add-tags">Add tags to imported contacts</Label>
                </div>

                <div className="pl-6">
                  <Input placeholder="Enter tags separated by commas" disabled />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 py-4">
            {importStatus === 'importing' ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Importing Contacts...</h3>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Please wait while we import your contacts. This may take a few minutes.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Processing {Math.floor((progress / 100) * previewData.length)} of{' '}
                  {previewData.length} contacts
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium">Import Complete</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Total Contacts</p>
                      <p className="text-2xl font-bold">{importResults.total}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Successfully Imported</p>
                      <p className="text-2xl font-bold text-green-600">{importResults.imported}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Updated</p>
                      <p className="text-2xl font-bold text-blue-600">{importResults.updated}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Errors</p>
                      <p className="text-2xl font-bold text-red-600">{importResults.errors}</p>
                    </CardContent>
                  </Card>
                </div>

                {importResults.errors > 0 && (
                  <div className="border rounded-md p-4 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-300">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Import completed with errors</p>
                        <p className="text-sm">
                          {importResults.errors} contacts could not be imported due to errors.
                          Download the error report for details.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Download Error Report
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        {step > 1 && step < 4 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}

        {step === 1 && (
          <Button variant="outline" onClick={() => onComplete()}>
            Cancel
          </Button>
        )}

        {step === 4 ? (
          <div className="flex gap-2 ml-auto">
            {importStatus === 'complete' && (
              <Button onClick={() => onComplete()}>View Contacts</Button>
            )}
          </div>
        ) : (
          step < 4 && (
            <Button
              onClick={() => {
                if (step === 3) {
                  handleStartImport();
                } else {
                  setStep(step + 1);
                }
              }}
              disabled={step === 1 && !file}
            >
              {step === 3 ? (
                <>Start Import</>
              ) : (
                <>
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
};

// Integration Import Component
const IntegrationImport = ({ onComplete }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Import from Integrations</CardTitle>
        <CardDescription>Connect and import contacts from other services</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 hover:border-primary cursor-pointer transition-colors">
            <CardContent className="p-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5.884 18.653c-.3-.2-.558-.456-.786-.738L5.38 17.6a5.47 5.47 0 0 0 .806.76c1.3.95 2.982 1.18 4.498.7 1.642-.53 3.044-2.14 3.304-3.82.26-1.67-.28-3.34-1.36-4.67-.36-.44-.98-.73-1.58-.8a.367.367 0 0 0-.31.15c-.09.1-.12.27 0 .45.1.19.28.35.56.35.143 0 .27.073.27.17a.25.25 0 0 1-.19.24l-1.2.2c-.12.017-.21.07-.26.17a.24.24 0 0 0 .04.28c.1.11.228.12.31.13.38.03.6.138.7.28a.272.272 0 0 1-.18.31c-.14.05-.22.05-.36.05a2.7 2.7 0 0 0-.318.025c-.04.002-.08.006-.118.012-.078.017-.145.06-.193.12-.057.066-.092.153-.1.247-.113 1.26-.905 2.33-2.084 2.73-1.21.41-2.525.22-3.52-.5a4.44 4.44 0 0 1-1.44-3.5c-.01-1.04.34-2.11 1.43-3.15.98-.93 2.28-1.434 3.57-1.43 1.3-.003 2.61.501 3.59 1.43.04.04.07.09.07.14a.35.35 0 0 1-.37.34.356.356 0 0 1-.23-.09c-.85-.82-1.95-1.27-3.07-1.27-1.11 0-2.21.46-3.07 1.27-.9.87-1.27 1.8-1.26 2.7-.01.86.307 1.674.86 2.31.73.88 2.17 1.42 3.47 1.05.65-.18 1.28-.59 1.66-1.24.32-.55.82-1.56.82-1.56s-.54-.01-1.67-.01c-.09 0-.14-.01-.2-.07-.06-.06-.1-.13-.1-.22 0-.18.15-.33.33-.33h2.34c.2 0 .51.08.57.49.02.11.03.22.03.33 0 .94-.43 1.95-.85 2.57-.7 1.04-1.82 1.71-3.09 1.96-1.27.25-2.63-.01-3.74-.7zm7.896-5.587a.384.384 0 0 1-.38.378H9.826a.374.374 0 0 1-.374-.378v-.13a.38.38 0 0 1 .38-.38l3.57-.004a.38.38 0 0 1 .38.38l-.002.13zm-.77-1.196a.382.382 0 0 1-.378.38l-3.56.002a.38.38 0 0 1-.38-.378v-.13a.379.379 0 0 1 .378-.38l3.561-.002a.38.38 0 0 1 .38.37v.14zm-.77-1.194a.38.38 0 0 1-.378.379l-3.56.002a.38.38 0 0 1-.38-.38v-.129a.38.38 0 0 1 .379-.379l3.56-.002a.38.38 0 0 1 .38.378l-.001.131zM20.296 5H3.714C2.767 5 2 5.774 2 6.73v10.54c0 .956.767 1.73 1.714 1.73h16.582c.947 0 1.714-.774 1.714-1.73V6.73C22.01 5.774 21.243 5 20.296 5zm.548 12.27c0 .3-.246.548-.548.548H3.714a.552.552 0 0 1-.548-.549V6.73c0-.3.246-.548.548-.548h16.582c.302 0 .548.246.548.549v10.538z" />
                </svg>
              </div>
              <h3 className="font-medium mb-1">Google Contacts</h3>
              <p className="text-sm text-muted-foreground">
                Import contacts from your Google account
              </p>
              <Button className="mt-4" size="sm">
                Connect
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary cursor-pointer transition-colors">
            <CardContent className="p-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.5 8.25h-2.25V6A5.25 5.25 0 0 0 12 .75 5.25 5.25 0 0 0 6.75 6v2.25H4.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5h15a1.5 1.5 0 0 0 1.5-1.5v-12a1.5 1.5 0 0 0-1.5-1.5ZM8.25 6A3.75 3.75 0 0 1 12 2.25 3.75 3.75 0 0 1 15.75 6v2.25h-7.5V6ZM19.5 21h-15V9.75h15V21Z" />
                </svg>
              </div>
              <h3 className="font-medium mb-1">Microsoft 365</h3>
              <p className="text-sm text-muted-foreground">
                Import Outlook and Microsoft 365 contacts
              </p>
              <Button className="mt-4" size="sm">
                Connect
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary cursor-pointer transition-colors">
            <CardContent className="p-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.92 2H3.08C2.484 2 2 2.484 2 3.08v17.84c0 .596.484 1.08 1.08 1.08h17.84c.596 0 1.08-.484 1.08-1.08V3.08C22 2.484 21.516 2 20.92 2zM8.41 18.5H5.26V9.86h3.15v8.64zm-1.58-9.82c-1.01 0-1.83-.82-1.83-1.83s.82-1.83 1.83-1.83 1.83.82 1.83 1.83-.82 1.83-1.83 1.83zm12.58 9.82h-3.15v-4.8c0-1.33-.49-2.05-1.5-2.05-1.1 0-1.68.74-1.68 2.05v4.8h-3.03V9.86h3.03v1.37c.63-.96 1.46-1.47 2.57-1.47 1.79 0 3.76 1.08 3.76 3.9v4.84z" />
                </svg>
              </div>
              <h3 className="font-medium mb-1">LinkedIn</h3>
              <p className="text-sm text-muted-foreground">Import contacts from LinkedIn</p>
              <Button className="mt-4" size="sm">
                Connect
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border hover:border-primary cursor-pointer transition-colors">
            <CardContent className="p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                <Database className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-sm font-medium mb-1">Salesforce</h3>
              <Button variant="outline" size="sm" className="mt-2">
                Connect
              </Button>
            </CardContent>
          </Card>

          <Card className="border hover:border-primary cursor-pointer transition-colors">
            <CardContent className="p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-2">
                <HardDrive className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-sm font-medium mb-1">HubSpot</h3>
              <Button variant="outline" size="sm" className="mt-2">
                Connect
              </Button>
            </CardContent>
          </Card>

          <Card className="border hover:border-primary cursor-pointer transition-colors">
            <CardContent className="p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-2">
                <svg className="h-6 w-6 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.91 5.09c-.91 1.75-.91 3.71-.91 7.67s0 5.92.91 7.67c.4.77.9 1.31 1.57 1.67 1.76.92 3.75.91 7.74.91s5.98.01 7.74-.91c.67-.36 1.17-.9 1.57-1.67.91-1.75.91-3.71.91-7.67s0-5.92-.91-7.67c-.4-.77-.9-1.31-1.57-1.67-1.76-.92-3.75-.91-7.74-.91s-5.98-.01-7.74.91c-.67.36-1.17.9-1.57 1.67zM12.43 5c1.81.02 3.92-.05 5.54.91.63.38.98.9 1.25 1.6.77 1.97.69 4.04.69 6.49 0 2.45.08 4.52-.69 6.49-.27.7-.62 1.22-1.25 1.6-1.62.96-3.73.89-5.54.91-1.81-.02-3.92.05-5.54-.91-.63-.38-.98-.9-1.25-1.6-.77-1.97-.69-4.04-.69-6.49 0-2.45-.08-4.52.69-6.49.27-.7.62-1.22 1.25-1.6 1.62-.96 3.73-.89 5.54-.91zM9.49 7.63c.32 0 .58.26.58.58v7.59c0 .32-.26.58-.58.58-.32 0-.58-.26-.58-.58V8.2c0-.32.26-.58.58-.58zm1.91 2.07c.32 0 .58.26.58.58v5.52c0 .32-.26.58-.58.58-.32 0-.58-.26-.58-.58v-5.52c0-.32.26-.58.58-.58zm1.91-1.49c.32 0 .58.26.58.58v7.01c0 .32-.26.58-.58.58-.32 0-.58-.26-.58-.58V8.78c0-.32.26-.58.58-.58zm1.91 1.49c.32 0 .58.26.58.58v5.52c0 .32-.26.58-.58.58-.32 0-.58-.26-.58-.58v-5.52c0-.32.26-.58.58-.58zm1.91-1.49c.32 0 .58.26.58.58v7.01c0 .32-.26.58-.58.58-.32 0-.58-.26-.58-.58V8.78c0-.32.26-.58.58-.58z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium mb-1">Mailchimp</h3>
              <Button variant="outline" size="sm" className="mt-2">
                Connect
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <Button variant="outline" onClick={() => onComplete()}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
};

// Apollo Import Component
const ApolloImport = ({ onComplete }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Import from Apollo.io</CardTitle>
        <CardDescription>Enrich and import contacts from Apollo.io</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 py-4">
        <div className="flex items-center gap-4 border rounded-md p-4 bg-blue-50 dark:bg-blue-900/20">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-white flex items-center justify-center">
            <svg
              className="h-6 w-6"
              viewBox="0 0 256 256"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="256" height="256" rx="60" fill="#3F51B5" />
              <path
                d="M191.68 64H64.32C58.07 64 53 69.07 53 75.32V180.68C53 186.93 58.07 192 64.32 192H191.68C197.93 192 203 186.93 203 180.68V75.32C203 69.07 197.93 64 191.68 64Z"
                fill="white"
              />
              <path
                d="M146.93 107.45C146.93 115.47 139.1 121.96 129.36 121.96C119.63 121.96 111.8 115.47 111.8 107.45C111.8 99.43 119.63 92.94 129.36 92.94C139.1 92.94 146.93 99.43 146.93 107.45Z"
                fill="#3F51B5"
              />
              <path
                d="M129.5 125.5C112.5 125.5 95 130.48 95 142.87V162H164V142.87C164 130.48 146.5 125.5 129.5 125.5Z"
                fill="#3F51B5"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium">Connect Apollo.io</h3>
            <p className="text-sm text-muted-foreground">
              Import and enrich contacts from Apollo.io. You can search for leads by company, title,
              location, and more.
            </p>
          </div>
          <Button>Connect Apollo</Button>
        </div>

        <div className="space-y-4 py-2">
          <h3 className="text-sm font-medium">Search Criteria</h3>
          <p className="text-sm text-muted-foreground">
            Define search criteria to find leads on Apollo.io
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-title">Job Title</Label>
              <Input id="search-title" placeholder="E.g. CEO, CTO, Marketing Director" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="search-company">Company</Label>
              <Input id="search-company" placeholder="E.g. Acme Inc, Tech Corp" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="search-industry">Industry</Label>
              <Select>
                <SelectTrigger id="search-industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="software">Software & Technology</SelectItem>
                  <SelectItem value="finance">Finance & Banking</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="retail">Retail & Consumer Goods</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search-location">Location</Label>
              <Input id="search-location" placeholder="E.g. San Francisco, New York, Remote" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="search-seniority">Seniority</Label>
              <Select>
                <SelectTrigger id="search-seniority">
                  <SelectValue placeholder="Select seniority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="c-suite">C-Suite</SelectItem>
                  <SelectItem value="vp">VP Level</SelectItem>
                  <SelectItem value="director">Director Level</SelectItem>
                  <SelectItem value="manager">Manager Level</SelectItem>
                  <SelectItem value="individual">Individual Contributors</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search-department">Department</Label>
              <Select>
                <SelectTrigger id="search-department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-2">
            <Button className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Search Contacts
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Enrich Existing Contacts</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Use Apollo.io to enrich your existing contacts with additional data such as job titles,
            companies, and more.
          </p>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Enrich Contacts
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <Button variant="outline" onClick={() => onComplete()}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
};

export function ContactsImportSection() {
  const { changeSection } = useDashboard();
  const [importMethod, setImportMethod] = useState('csv'); // csv, integration, apollo

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => changeSection('contacts')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Import Contacts</h1>
      </div>

      <Tabs value={importMethod} onValueChange={setImportMethod} className="w-full">
        <TabsList className="w-full sm:w-auto mb-4">
          <TabsTrigger value="csv" className="flex-1">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            CSV File
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex-1">
            <Database className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="apollo" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            Apollo.io
          </TabsTrigger>
        </TabsList>

        <TabsContent value="csv">
          <CSVImport onComplete={() => changeSection('contacts')} />
        </TabsContent>

        <TabsContent value="integration">
          <IntegrationImport onComplete={() => changeSection('contacts')} />
        </TabsContent>

        <TabsContent value="apollo">
          <ApolloImport onComplete={() => changeSection('contacts')} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
