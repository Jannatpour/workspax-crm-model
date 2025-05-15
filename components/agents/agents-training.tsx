'use client';

import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Bot,
  UserCircle,
  UsersRound,
  GitBranch,
  PlusCircle,
  Brain,
  Check,
  Upload,
  FileSpreadsheet,
  FileUp,
  FileText,
  MessageSquare,
  Code,
  BookOpen,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';

// Sample training data
const exampleTrainingData = [
  {
    id: '1',
    name: 'Customer Support FAQs',
    description: 'Frequently asked questions about our products and services',
    type: 'TEXT',
    status: 'processed',
    createdAt: '2025-04-15T10:30:00Z',
    size: '234 KB',
  },
  {
    id: '2',
    name: 'Sales Conversations',
    description: 'Sample successful sales conversations to learn patterns from',
    type: 'CONVERSATION',
    status: 'processing',
    createdAt: '2025-05-01T14:20:00Z',
    size: '1.2 MB',
  },
  {
    id: '3',
    name: 'Product Knowledge Base',
    description: 'Detailed information about our product lineup',
    type: 'DOCUMENT',
    status: 'processed',
    createdAt: '2025-05-08T09:15:00Z',
    size: '4.5 MB',
  },
  {
    id: '4',
    name: 'Customer Feedback 2024-Q1',
    description: 'Collected customer feedback from the first quarter',
    type: 'STRUCTURED_DATA',
    status: 'failed',
    createdAt: '2025-04-12T11:45:00Z',
    size: '892 KB',
  },
];

// Data sources types for training
const dataSourceTypes = [
  {
    id: 'text',
    name: 'Text',
    description: 'Plain text for direct instruction',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: 'conversation',
    name: 'Conversations',
    description: 'Example dialogues to learn from',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    id: 'document',
    name: 'Documents',
    description: 'PDFs, Word docs, and other files',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: 'structured',
    name: 'Structured Data',
    description: 'CSV, JSON, or other data formats',
    icon: <FileSpreadsheet className="h-5 w-5" />,
  },
  {
    id: 'code',
    name: 'Code Samples',
    description: 'Example code to understand patterns',
    icon: <Code className="h-5 w-5" />,
  },
  {
    id: 'api',
    name: 'API Responses',
    description: 'Example API responses for integration',
    icon: <GitBranch className="h-5 w-5" />,
  },
];

export function AgentsTraining() {
  const { changeSection } = useDashboard();
  const [activeTab, setActiveTab] = useState('data');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(exampleTrainingData);
  const [uploadType, setUploadType] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');

  // Filter training data based on search query
  useEffect(() => {
    if (searchQuery) {
      setFilteredData(
        exampleTrainingData.filter(
          item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredData(exampleTrainingData);
    }
  }, [searchQuery]);

  // Simulate file upload with progress
  const handleUpload = () => {
    if (!uploadName.trim() || !uploadType || !uploadDescription.trim()) {
      toast({
        title: 'Incomplete information',
        description: 'Please fill all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 10) + 1;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
            setUploadName('');
            setUploadDescription('');
            setUploadType('');
            toast({
              title: 'Upload successful',
              description: 'Your training data has been uploaded and is being processed.',
            });
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get status badge for training data
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Processed</Badge>
        );
      case 'processing':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Agent Training</h1>
          <p className="text-muted-foreground">Improve your AI agents with custom training data</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="data">Training Data</TabsTrigger>
          <TabsTrigger value="models">Fine-tuned Models</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Training Data Tab */}
        <TabsContent value="data" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">Different data types</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">6.8 MB total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Processing Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">75%</div>
                <p className="text-xs text-muted-foreground">3 of 4 files processed</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Training Data Upload Form */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Upload Training Data</CardTitle>
                <CardDescription>Add new data to improve your agents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {dataSourceTypes.map(type => (
                      <div
                        key={type.id}
                        className={`border rounded-md p-2 cursor-pointer hover:border-primary/50 transition-colors ${
                          uploadType === type.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setUploadType(type.id)}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center mb-1">
                            {type.icon}
                          </div>
                          <div className="text-xs font-medium">{type.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="Enter a name for this data"
                    value={uploadName}
                    onChange={e => setUploadName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="What information does this data contain?"
                    className="resize-none h-20"
                    value={uploadDescription}
                    onChange={e => setUploadDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">File Upload</label>
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center">
                    <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Drag & drop files here</p>
                    <p className="text-xs text-muted-foreground mb-2">Or click to browse files</p>
                    <Button variant="outline" size="sm">
                      Select Files
                    </Button>
                  </div>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" disabled={isUploading} onClick={handleUpload}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Data
                </Button>
              </CardFooter>
            </Card>

            {/* Training Data List */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Training Data Library</CardTitle>
                <CardDescription>Manage your uploaded training data</CardDescription>
                <div className="mt-2">
                  <Input
                    type="search"
                    placeholder="Search training data..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {filteredData.length > 0 ? (
                      filteredData.map(item => (
                        <div key={item.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                {item.type === 'TEXT' && (
                                  <FileText className="h-5 w-5 text-primary" />
                                )}
                                {item.type === 'CONVERSATION' && (
                                  <MessageSquare className="h-5 w-5 text-primary" />
                                )}
                                {item.type === 'DOCUMENT' && (
                                  <FileText className="h-5 w-5 text-primary" />
                                )}
                                {item.type === 'STRUCTURED_DATA' && (
                                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium">{item.name}</h3>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              {getStatusBadge(item.status)}
                            </div>
                          </div>
                          <div className="mt-2 flex justify-between items-center text-xs text-muted-foreground">
                            <div>Uploaded: {formatDate(item.createdAt)}</div>
                            <div>Size: {item.size}</div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              Assign to Agent
                            </Button>
                            {item.status === 'failed' && (
                              <Button variant="outline" size="sm">
                                Retry
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="bg-muted/30 rounded-full p-3 inline-flex mb-4">
                          <FileUp className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No data found</h3>
                        <p className="text-muted-foreground mt-1">
                          {searchQuery
                            ? 'Try a different search term'
                            : 'Upload some training data to get started'}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fine-tuned Models Tab */}
        <TabsContent value="models" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Fine-tuned Models</CardTitle>
              <CardDescription>Custom AI models trained on your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-muted/30 rounded-full p-4 mb-4">
                  <Brain className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No fine-tuned models yet</h3>
                <p className="text-muted-foreground max-w-md mt-2 mb-6">
                  Create a custom model by training on your data to improve your agents' performance
                </p>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Fine-tuned Model
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Analytics</CardTitle>
              <CardDescription>
                Performance metrics for your training data and models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-muted/30 rounded-full p-4 mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No analytics available</h3>
                <p className="text-muted-foreground max-w-md mt-2 mb-6">
                  Analytics will be available once you have trained models and used them in your
                  agents
                </p>
                <Button variant="outline" onClick={() => setActiveTab('data')}>
                  Upload Training Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
