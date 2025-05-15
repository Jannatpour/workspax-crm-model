'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ChevronLeft, Download, FileSpreadsheet, FileText, Check, Filter } from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';

export function ContactsExportSection() {
  const { changeSection } = useDashboard();
  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedFields, setSelectedFields] = useState([
    'firstName',
    'lastName',
    'email',
    'phone',
    'company',
    'title',
  ]);
  const [exportFilter, setExportFilter] = useState('all');
  const [showExportingDialog, setShowExportingDialog] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);

  // Handle field toggle
  const handleFieldToggle = field => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter(f => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  // Handle export start
  const handleExport = () => {
    setShowExportingDialog(true);
    setExportProgress(0);
    setExportComplete(false);

    // Simulate export progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setExportProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setExportComplete(true);
      }
    }, 100);
  };

  // Field options for export
  const fieldOptions = [
    { id: 'firstName', label: 'First Name' },
    { id: 'lastName', label: 'Last Name' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'company', label: 'Company' },
    { id: 'title', label: 'Job Title' },
    { id: 'address', label: 'Address' },
    { id: 'city', label: 'City' },
    { id: 'state', label: 'State' },
    { id: 'country', label: 'Country' },
    { id: 'website', label: 'Website' },
    { id: 'linkedinUrl', label: 'LinkedIn URL' },
    { id: 'twitterUrl', label: 'Twitter URL' },
    { id: 'tags', label: 'Tags' },
    { id: 'leadStatus', label: 'Lead Status' },
    { id: 'source', label: 'Source' },
    { id: 'dateAdded', label: 'Date Added' },
    { id: 'lastActivity', label: 'Last Activity' },
    { id: 'notes', label: 'Notes' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => changeSection('contacts')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Export Contacts</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Settings</CardTitle>
          <CardDescription>Choose which contacts and fields to export</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Export Format</h3>
            <RadioGroup
              value={exportFormat}
              onValueChange={setExportFormat}
              className="flex space-x-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="csv" id="format-csv" />
                <Label htmlFor="format-csv" className="flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="xlsx" id="format-xlsx" />
                <Label htmlFor="format-xlsx" className="flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel (XLSX)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="vcf" id="format-vcf" />
                <Label htmlFor="format-vcf" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  vCard (VCF)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contacts to Export</h3>
            <RadioGroup value={exportFilter} onValueChange={setExportFilter} className="space-y-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id="filter-all" />
                <Label htmlFor="filter-all" className="cursor-pointer">
                  All Contacts (1,248)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="selected" id="filter-selected" />
                <Label htmlFor="filter-selected" className="cursor-pointer">
                  Selected Contacts
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="filtered" id="filter-filtered" />
                <Label htmlFor="filter-filtered" className="cursor-pointer flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Apply Filter
                </Label>
              </div>
            </RadioGroup>

            {exportFilter === 'filtered' && (
              <Card className="mt-2 border-dashed">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Filter by</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <Checkbox id="filter-leads" />
                        <Label htmlFor="filter-leads">Lead Status: Qualified</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="filter-source" />
                        <Label htmlFor="filter-source">Source: Website</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="filter-tag" />
                        <Label htmlFor="filter-tag">Has Tag: Client</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="filter-date" />
                        <Label htmlFor="filter-date">Added in last 30 days</Label>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Apply Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Fields to Export</h3>
              <Button
                variant="link"
                size="sm"
                onClick={() => setSelectedFields(fieldOptions.map(f => f.id))}
              >
                Select All
              </Button>
            </div>

            <div className="border rounded-md p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {fieldOptions.map(field => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`field-${field.id}`}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={() => handleFieldToggle(field.id)}
                    />
                    <Label htmlFor={`field-${field.id}`} className="cursor-pointer">
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <Button variant="outline" onClick={() => changeSection('contacts')}>
            Cancel
          </Button>
          <Dialog open={showExportingDialog} onOpenChange={setShowExportingDialog}>
            <DialogTrigger asChild>
              <Button onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Contacts
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {exportComplete ? 'Export Complete' : 'Exporting Contacts'}
                </DialogTitle>
                <DialogDescription>
                  {exportComplete
                    ? 'Your contacts have been exported successfully.'
                    : 'Please wait while we prepare your export file.'}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                {exportComplete ? (
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                      <Check className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">Export Complete</p>
                      <p className="text-sm text-muted-foreground">
                        {exportFilter === 'all' ? '1,248' : '75'} contacts exported as{' '}
                        {exportFormat.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Progress value={exportProgress} className="h-2" />
                    <p className="text-sm text-center text-muted-foreground">
                      Exporting {exportFilter === 'all' ? '1,248' : '75'} contacts...
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                {exportComplete ? (
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowExportingDialog(false);
                        changeSection('contacts');
                      }}
                    >
                      Close
                    </Button>
                    <Button className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setShowExportingDialog(false)}>
                    Cancel
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}
