'use client';

import React, { useState } from 'react';
import { ArrowLeft, Download, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useDashboard } from '@/context/dashboard-context';
import { useToast } from '@/components/ui/sonner';

export function ContactsExport() {
  const { goBack } = useDashboard();
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedFields, setSelectedFields] = useState({
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    company: true,
    title: true,
    address: true,
    tags: true,
    notes: true,
    status: true,
    lastContacted: true,
    createdAt: true,
    updatedAt: true,
  });
  const [exportFilters, setExportFilters] = useState({
    allContacts: true,
    onlyActive: false,
    onlyStarred: false,
    dateRange: 'all',
  });
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<'configuring' | 'exporting' | 'complete'>(
    'configuring'
  );

  // Handle field selection
  const handleFieldToggle = (field: string) => {
    setSelectedFields({
      ...selectedFields,
      [field]: !selectedFields[field as keyof typeof selectedFields],
    });
  };

  // Handle filter changes
  const handleFilterChange = (filter: string, value: any) => {
    setExportFilters({
      ...exportFilters,
      [filter]: value,
    });
  };

  // Start export process
  const handleStartExport = () => {
    setExportStatus('exporting');

    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setExportStatus('complete');
          toast({
            title: 'Export complete',
            description: `Your contacts have been exported successfully.`,
          });
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  // Handle download
  const handleDownload = () => {
    const filename = `contacts-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`;

    // In a real implementation, this would create a download link to the exported file
    toast({
      title: 'Download started',
      description: `Your file "${filename}" is downloading.`,
    });

    // For demo purposes, reset the export status after download
    setTimeout(() => {
      setExportStatus('configuring');
      setExportProgress(0);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Export Contacts</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {exportStatus === 'configuring' && 'Configure Export'}
                {exportStatus === 'exporting' && 'Exporting...'}
                {exportStatus === 'complete' && 'Export Complete'}
              </CardTitle>
              <CardDescription>
                {exportStatus === 'configuring' && 'Select the data you want to export'}
                {exportStatus === 'exporting' && 'Your contacts are being exported'}
                {exportStatus === 'complete' && 'Your contacts have been exported successfully'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exportStatus === 'configuring' && (
                <Tabs defaultValue="format" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="format">Format</TabsTrigger>
                    <TabsTrigger value="fields">Fields</TabsTrigger>
                    <TabsTrigger value="filters">Filters</TabsTrigger>
                  </TabsList>

                  <TabsContent value="format" className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Export Format</Label>
                      <RadioGroup
                        defaultValue="csv"
                        value={exportFormat}
                        onValueChange={setExportFormat}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="csv" id="format-csv" />
                          <Label htmlFor="format-csv" className="cursor-pointer">
                            CSV (.csv) - Comma Separated Values
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="xlsx" id="format-excel" />
                          <Label htmlFor="format-excel" className="cursor-pointer">
                            Excel (.xlsx) - Microsoft Excel
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="vcf" id="format-vcard" />
                          <Label htmlFor="format-vcard" className="cursor-pointer">
                            vCard (.vcf) - Standard Contact Format
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </TabsContent>

                  <TabsContent value="fields" className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Contact Fields to Export</Label>
                        <Button
                          variant="link"
                          onClick={() =>
                            setSelectedFields({
                              firstName: true,
                              lastName: true,
                              email: true,
                              phone: true,
                              company: true,
                              title: true,
                              address: true,
                              tags: true,
                              notes: true,
                              status: true,
                              lastContacted: true,
                              createdAt: true,
                              updatedAt: true,
                            })
                          }
                          className="h-8 px-2"
                        >
                          Select All
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="field-firstName"
                            checked={selectedFields.firstName}
                            onCheckedChange={() => handleFieldToggle('firstName')}
                          />
                          <Label
                            htmlFor="field-firstName"
                            className="font-normal cursor-pointer leading-tight"
                          >
                            First Name
                          </Label>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="field-lastName"
                            checked={selectedFields.lastName}
                            onCheckedChange={() => handleFieldToggle('lastName')}
                          />
                          <Label
                            htmlFor="field-lastName"
                            className="font-normal cursor-pointer leading-tight"
                          >
                            Last Name
                          </Label>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="field-email"
                            checked={selectedFields.email}
                            onCheckedChange={() => handleFieldToggle('email')}
                          />
                          <Label
                            htmlFor="field-email"
                            className="font-normal cursor-pointer leading-tight"
                          >
                            Email Address
                          </Label>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="field-phone"
                            checked={selectedFields.phone}
                            onCheckedChange={() => handleFieldToggle('phone')}
                          />
                          <Label
                            htmlFor="field-phone"
                            className="font-normal cursor-pointer leading-tight"
                          >
                            Phone Number
                          </Label>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="field-company"
                            checked={selectedFields.company}
                            onCheckedChange={() => handleFieldToggle('company')}
                          />
                          <Label
                            htmlFor="field-company"
                            className="font-normal cursor-pointer leading-tight"
                          >
                            Company
                          </Label>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="field-title"
                            checked={selectedFields.title}
                            onCheckedChange={() => handleFieldToggle('title')}
                          />
                          <Label
                            htmlFor="field-title"
                            className="font-normal cursor-pointer leading-tight"
                          >
                            Job Title
                          </Label>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="field-address"
                            checked={selectedFields.address}
                            onCheckedChange={() => handleFieldToggle('address')}
                          />
                          <Label
                            htmlFor="field-address"
                            className="font-normal cursor-pointer leading-tight"
                          >
                            Address
                          </Label>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="field-tags"
                            checked={selectedFields.tags}
                            onCheckedChange={() => handleFieldToggle('tags')}
                          />
                          <Label
                            htmlFor="field-tags"
                            className="font-normal cursor-pointer leading-tight"
                          >
                            Tags
                          </Label>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="field-notes"
                            checked={selectedFields.notes}
                            onCheckedChange={() => handleFieldToggle('notes')}
                          />
                          <Label
                            htmlFor="field-notes"
                            className="font-normal cursor-pointer leading-tight"
                          >
                            Notes
                          </Label>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="field-status"
                            checked={selectedFields.status}
                            onCheckedChange={() => handleFieldToggle('status')}
                          />
                          <Label
                            htmlFor="field-status"
                            className="font-normal cursor-pointer leading-tight"
                          >
                            Status
                          </Label>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="field-lastContacted"
                            checked={selectedFields.lastContacted}
                            onCheckedChange={() => handleFieldToggle('lastContacted')}
                          />
                          <Label
                            htmlFor="field-lastContacted"
                            className="font-normal cursor-pointer leading-tight"
                          >
                            Last Contacted Date
                          </Label>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="field-createdAt"
                            checked={selectedFields.createdAt}
                            onCheckedChange={() => handleFieldToggle('createdAt')}
                          />
                          <Label
                            htmlFor="field-createdAt"
                            className="font-normal cursor-pointer leading-tight"
                          >
                            Created Date
                          </Label>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="field-updatedAt"
                            checked={selectedFields.updatedAt}
                            onCheckedChange={() => handleFieldToggle('updatedAt')}
                          />
                          <Label
                            htmlFor="field-updatedAt"
                            className="font-normal cursor-pointer leading-tight"
                          >
                            Updated Date
                          </Label>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="filters" className="pt-4 space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Which contacts to export</Label>
                        <RadioGroup
                          defaultValue="allContacts"
                          onValueChange={value => {
                            setExportFilters({
                              ...exportFilters,
                              allContacts: value === 'allContacts',
                              onlyActive: value === 'onlyActive',
                              onlyStarred: value === 'onlyStarred',
                            });
                          }}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="allContacts"
                              id="filter-all"
                              checked={exportFilters.allContacts}
                            />
                            <Label htmlFor="filter-all" className="cursor-pointer">
                              All Contacts
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="onlyActive"
                              id="filter-active"
                              checked={exportFilters.onlyActive}
                            />
                            <Label htmlFor="filter-active" className="cursor-pointer">
                              Only Active Contacts
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="onlyStarred"
                              id="filter-starred"
                              checked={exportFilters.onlyStarred}
                            />
                            <Label htmlFor="filter-starred" className="cursor-pointer">
                              Only Starred Contacts
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label>Date Range</Label>
                        <RadioGroup
                          defaultValue="all"
                          value={exportFilters.dateRange}
                          onValueChange={value => handleFilterChange('dateRange', value)}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="date-all" />
                            <Label htmlFor="date-all" className="cursor-pointer">
                              All Time
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="last30days" id="date-30" />
                            <Label htmlFor="date-30" className="cursor-pointer">
                              Last 30 Days
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="last90days" id="date-90" />
                            <Label htmlFor="date-90" className="cursor-pointer">
                              Last 90 Days
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="thisYear" id="date-year" />
                            <Label htmlFor="date-year" className="cursor-pointer">
                              This Year
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}

              {exportStatus === 'exporting' && (
                <div className="text-center py-6">
                  <Download className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                  <h3 className="text-lg font-medium mb-2">Exporting Contacts</h3>
                  <p className="text-muted-foreground mb-4">
                    Please wait while we prepare your export file. This may take a few moments.
                  </p>
                  <Progress value={exportProgress} className="w-full h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {Math.round(exportProgress)}% complete
                  </p>
                </div>
              )}

              {exportStatus === 'complete' && (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Export Complete</h3>
                  <p className="text-muted-foreground mb-4">
                    Your contacts have been exported successfully. Click the button below to
                    download the file.
                  </p>
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Export File
                  </Button>
                </div>
              )}
            </CardContent>
            {exportStatus === 'configuring' && (
              <CardFooter className="flex justify-end">
                <Button onClick={handleStartExport}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export Contacts
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Export Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Available Formats</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    <span className="font-medium">CSV</span> - Simple tabular format that can be
                    opened with Excel or Google Sheets.
                  </p>
                  <p>
                    <span className="font-medium">Excel</span> - Native Microsoft Excel format with
                    formatting.
                  </p>
                  <p>
                    <span className="font-medium">vCard</span> - Standard format for contact
                    information that can be imported into most contact management apps.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Data Privacy</h4>
                <p className="text-sm text-muted-foreground">
                  Please be mindful of data privacy regulations when exporting contact information.
                  Ensure you have the proper permissions to store and use this data.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Troubleshooting</h4>
                <p className="text-sm text-muted-foreground">
                  If you encounter issues with your export file, try choosing a different format or
                  reducing the number of contacts by using filters.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
