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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BrainCircuit,
  BookOpen,
  Plus,
  Search,
  MoreHorizontal,
  PenSquare,
  Trash2,
  Bot,
  FileText,
  RefreshCw,
  UploadCloud,
  ListTodo,
  MessageSquare,
  Bot as BotIcon,
  Calendar,
  CheckCircle,
  ArrowRight,
  Sparkles,
  FileUp,
  HelpCircle,
  Download,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock training datasets
const mockDatasets = [
  {
    id: '1',
    name: 'Sales Conversations',
    description: 'Training data from successful sales conversations',
    documentCount: 124,
    size: '4.2 MB',
    status: 'processed',
    createdAt: new Date('2023-03-15'),
    updatedAt: new Date('2023-03-15'),
  },
  {
    id: '2',
    name: 'Email Templates',
    description: 'Email templates for common customer inquiries',
    documentCount: 45,
    size: '1.8 MB',
    status: 'processed',
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-04-10'),
  },
  {
    id: '3',
    name: 'Support Knowledge Base',
    description: 'Knowledge base articles for customer support',
    documentCount: 78,
    size: '3.5 MB',
    status: 'processing',
    progress: 65,
    createdAt: new Date('2023-05-05'),
    updatedAt: new Date('2023-05-05'),
  },
];

// Mock training tasks
const mockTrainingTasks = [
  {
    id: '1',
    name: 'Train Sales Assistant',
    description: 'Training sales assistant bot on customer interactions',
    status: 'completed',
    progress: 100,
    agentId: '1',
    agentName: 'Sales Assistant',
    datasets: ['1'],
    createdAt: new Date('2023-04-20'),
    completedAt: new Date('2023-04-21'),
  },
  {
    id: '2',
    name: 'Train Support Helper',
    description: 'Training support helper bot on knowledge base',
    status: 'in_progress',
    progress: 45,
    agentId: '3',
    agentName: 'Support Helper',
    datasets: ['3'],
    createdAt: new Date('2023-05-08'),
  },
  {
    id: '3',
    name: 'Improve Meeting Scheduler',
    description: 'Fine-tuning meeting scheduler with real examples',
    status: 'queued',
    progress: 0,
    agentId: '2',
    agentName: 'Meeting Scheduler',
    datasets: ['2'],
    createdAt: new Date('2023-05-10'),
  },
];

// Dataset Card component
const DatasetCard = ({ dataset, onEdit, onDelete, onView }) => {
  const formatDate = date => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{dataset.name}</CardTitle>
            <CardDescription>{dataset.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Dataset Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onView(dataset.id)}>
                <FileText className="h-4 w-4 mr-2" />
                View Documents
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(dataset.id)}>
                <PenSquare className="h-4 w-4 mr-2" />
                Edit Dataset
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Download Dataset
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(dataset.id)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Dataset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{dataset.documentCount} documents</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{dataset.size}</Badge>
          </div>
        </div>

        {dataset.status === 'processing' ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>Processing...</span>
              <span>{dataset.progress}%</span>
            </div>
            <Progress value={dataset.progress} className="h-1.5" />
          </div>
        ) : (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Ready to use
          </Badge>
        )}
      </CardContent>
      <CardFooter className="pt-2 border-t text-xs text-muted-foreground">
        <div className="flex justify-between w-full">
          <span>Created {formatDate(dataset.createdAt)}</span>
          <span>Updated {formatDate(dataset.updatedAt)}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

// Training Task Card component
const TrainingTaskCard = ({ task, onViewDetails }) => {
  const formatDate = date => {
    return (
      date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const getStatusBadge = status => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            In Progress
          </Badge>
        );
      case 'queued':
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
            <Clock className="h-3 w-3 mr-1" />
            Queued
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card
      className="cursor-pointer hover:border-primary transition-all"
      onClick={() => onViewDetails(task.id)}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{task.name}</h3>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>
          {getStatusBadge(task.status)}
        </div>

        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <BotIcon className="h-4 w-4" />
          </div>
          <span className="text-sm">{task.agentName}</span>
        </div>

        {task.status === 'in_progress' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>Training progress</span>
              <span>{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-1.5" />
          </div>
        )}

        <div className="pt-2 border-t text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Started {formatDate(task.createdAt)}</span>
            {task.completedAt && <span>Completed {formatDate(task.completedAt)}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Create Dataset Form
const CreateDatasetForm = ({ onCancel, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uploadMethod, setUploadMethod] = useState('files');

  const handleSubmit = e => {
    e.preventDefault();

    onCreate({
      name,
      description,
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Training Dataset</CardTitle>
        <CardDescription>
          Datasets are used to train your AI agents with specific knowledge
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="dataset-name" className="text-sm font-medium">
              Dataset Name
            </label>
            <Input
              id="dataset-name"
              placeholder="E.g. Sales Scripts, Support Knowledge Base"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dataset-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="dataset-description"
              placeholder="What kind of data is in this dataset?"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Method</label>
            <Tabs defaultValue={uploadMethod} onValueChange={setUploadMethod} className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="folder">Folder</TabsTrigger>
                <TabsTrigger value="api">API</TabsTrigger>
              </TabsList>

              <TabsContent value="files" className="mt-4 space-y-4">
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <UploadCloud className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Upload Files</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop files here, or click to browse
                    </p>
                    <Button>
                      <FileUp className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                      Supported formats: PDF, DOCX, TXT, CSV, XLSX, JSON
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="folder" className="mt-4 space-y-4">
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <UploadCloud className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Upload Folder</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose a folder with documents to upload
                    </p>
                    <Button>
                      <FileUp className="h-4 w-4 mr-2" />
                      Choose Folder
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api" className="mt-4 space-y-4">
                <Card className="border">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-2">API Integration</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect to an external source to import documents
                    </p>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-20 flex flex-col">
                          <svg className="h-6 w-6 mb-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm.14 19.018c-3.868 0-7-3.14-7-7.018 0-3.878 3.132-7.018 7-7.018s7 3.14 7 7.018c0 3.878-3.132 7.018-7 7.018zm6.258-11.477c-.176-.358-.498-.598-.877-.598-.128 0-.252.02-.37.059l-5.59 1.848c-.369.127-.624.47-.624.862v2.99c-.239-.128-.51-.207-.797-.207-.916 0-1.652.743-1.652 1.658s.736 1.658 1.652 1.658 1.653-.743 1.653-1.658v-3.253l4.838-1.605v1.893c-.238-.128-.512-.207-.798-.207-.915 0-1.652.743-1.652 1.658s.737 1.658 1.652 1.658c.916 0 1.652-.743 1.652-1.658v-4.357c0-.102-.01-.2-.03-.294l.943-1.656z" />
                          </svg>
                          Spotify
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col">
                          <svg className="h-6 w-6 mb-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.258 1H2.845C1.836 1 1 1.836 1 2.845v18.16c0 1.009.836 1.845 1.845 1.845h10.405v-7.893h-2.654v-3.074h2.654V9.61c0-2.628 1.606-4.058 3.95-4.058 1.124 0 2.086.084 2.368.122v2.742h-1.624c-1.276 0-1.525.602-1.525 1.49v1.95h3.046l-.397 3.074h-2.65V22.9h5.194c1.01 0 1.845-.836 1.845-1.845V2.845C24.103 1.837 23.268 1 22.258 1" />
                          </svg>
                          Facebook
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col">
                          <svg className="h-6 w-6 mb-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 19c-4.97 0-9-4.03-9-9s4.03-9 9-9c4.971 0 9 4.03 9 9s-4.029 9-9 9zm0-16.5c-4.136 0-7.5 3.364-7.5 7.5s3.364 7.5 7.5 7.5c4.137 0 7.5-3.364 7.5-7.5s-3.363-7.5-7.5-7.5zm12.563 16.5c-.148 0-.299-.035-.435-.104C20.453 18.558 20 17.808 20 17c0-.822.453-1.573 1.128-1.896.636-.313 1.464-.151 1.927.379.462.531.562 1.29.25 1.925-.312.637-1.005 1.093-1.742 1.093V19zM12.5 7h-1v5.116l3.693 2.674.581-.802-3.275-2.375V7z" />
                          </svg>
                          Google Drive
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col">
                          <svg className="h-6 w-6 mb-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.672 15.226l-2.432.811.841 2.515c.33 1.019-.209 2.127-1.23 2.456-1.15.325-2.148-.321-2.463-1.226l-.84-2.518-5.013 1.677.84 2.517c.391 1.203-.434 2.542-1.831 2.542-.88 0-1.601-.564-1.86-1.314l-.842-2.516-2.431.809c-1.135.328-2.145-.317-2.558-1.839 0-.352.072-.698.206-1.018.278-.693 1.025-1.194 1.903-1.194.318 0 .611.073.902.212l2.43-.809-.862-2.577c-.164-.493-.142-1.037.087-1.519.351-.771 1.039-1.239 1.809-1.239.341 0 .682.077.994.23.789.328 1.295 1.059 1.291 1.886l.862 2.577 5.011-1.679-.859-2.576c-.195-.581-.111-1.203.211-1.702.322-.513.862-.798 1.403-.798.199 0 .398.031.596.097.788.282 1.333 1.107 1.333 2.101 0 .189-.036.381-.109.565l-.862 2.577z" />
                          </svg>
                          Slack
                        </Button>
                      </div>

                      <Button variant="outline" className="w-full">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        More Integrations
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleSubmit}>
          Create Dataset
        </Button>
      </CardFooter>
    </Card>
  );
};

// Create Training Task Form
const CreateTrainingTaskForm = ({ onCancel, onCreate, datasets }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedDatasets, setSelectedDatasets] = useState([]);

  // Mock agent data
  const agents = [
    { id: '1', name: 'Sales Assistant', type: 'email' },
    { id: '2', name: 'Meeting Scheduler', type: 'calendar' },
    { id: '3', name: 'Support Helper', type: 'chat' },
    { id: '4', name: 'Lead Qualifier', type: 'email' },
  ];

  const handleSubmit = e => {
    e.preventDefault();

    onCreate({
      name,
      description,
      agentId: selectedAgent,
      agentName: agents.find(a => a.id === selectedAgent)?.name || '',
      datasets: selectedDatasets,
      status: 'queued',
      progress: 0,
      createdAt: new Date(),
    });
  };

  const toggleDatasetSelection = datasetId => {
    if (selectedDatasets.includes(datasetId)) {
      setSelectedDatasets(selectedDatasets.filter(id => id !== datasetId));
    } else {
      setSelectedDatasets([...selectedDatasets, datasetId]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Training Task</CardTitle>
        <CardDescription>Train or fine-tune an AI agent with your custom datasets</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="task-name" className="text-sm font-medium">
              Task Name
            </label>
            <Input
              id="task-name"
              placeholder="E.g. Train Sales Assistant, Fine-tune Support Helper"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="task-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="task-description"
              placeholder="What is the purpose of this training task?"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Agent to Train</label>
            <div className="grid grid-cols-2 gap-2">
              {agents.map(agent => (
                <div
                  key={agent.id}
                  className={`flex items-center gap-2 border rounded-md p-3 cursor-pointer ${
                    selectedAgent === agent.id ? 'bg-primary/10 border-primary' : ''
                  }`}
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      agent.type === 'email'
                        ? 'bg-blue-100 text-blue-700'
                        : agent.type === 'calendar'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {agent.type === 'email' ? (
                      <Mail className="h-4 w-4" />
                    ) : agent.type === 'calendar' ? (
                      <Calendar className="h-4 w-4" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{agent.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{agent.type} Agent</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Datasets</label>
            <Card className="border-dashed">
              <CardContent className="p-4 space-y-2">
                {datasets.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No datasets available
                  </div>
                ) : (
                  datasets.map(dataset => (
                    <div
                      key={dataset.id}
                      className={`flex items-center justify-between border rounded-md p-3 cursor-pointer ${
                        selectedDatasets.includes(dataset.id) ? 'bg-primary/10 border-primary' : ''
                      } ${dataset.status !== 'processed' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() =>
                        dataset.status === 'processed' && toggleDatasetSelection(dataset.id)
                      }
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{dataset.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {dataset.documentCount} documents
                          </p>
                        </div>
                      </div>
                      {dataset.status === 'processed' ? (
                        selectedDatasets.includes(dataset.id) && <Badge>Selected</Badge>
                      ) : (
                        <Badge variant="outline">Processing</Badge>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <label className="text-sm font-medium">Training Options</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="training-epochs" className="text-sm">
                  Training epochs
                </label>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                    -
                  </Button>
                  <span className="text-sm mx-2">3</span>
                  <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                    +
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="learning-rate" className="text-sm">
                  Learning rate
                </label>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                    -
                  </Button>
                  <span className="text-sm mx-2">0.001</span>
                  <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                    +
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="batch-size" className="text-sm">
                  Batch size
                </label>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                    -
                  </Button>
                  <span className="text-sm mx-2">16</span>
                  <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                    +
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={!selectedAgent || selectedDatasets.length === 0}
        >
          Start Training
        </Button>
      </CardFooter>
    </Card>
  );
};

export function AgentsTrainingSection() {
  const { changeSection } = useDashboard();
  const [activeTab, setActiveTab] = useState('datasets');
  const [searchTerm, setSearchTerm] = useState('');
  const [datasets, setDatasets] = useState(mockDatasets);
  const [trainingTasks, setTrainingTasks] = useState(mockTrainingTasks);
  const [showCreateDataset, setShowCreateDataset] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [viewingTaskId, setViewingTaskId] = useState(null);

  // Filter datasets based on search term
  const filteredDatasets = datasets.filter(dataset => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();

    return (
      dataset.name.toLowerCase().includes(searchLower) ||
      dataset.description.toLowerCase().includes(searchLower)
    );
  });

  // Filter training tasks based on search term
  const filteredTasks = trainingTasks.filter(task => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();

    return (
      task.name.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower) ||
      task.agentName.toLowerCase().includes(searchLower)
    );
  });

  // Handler for creating a new dataset
  const handleCreateDataset = newDataset => {
    const datasetWithId = {
      ...newDataset,
      id: Date.now().toString(),
      documentCount: 0,
      size: '0 KB',
      status: 'processing',
      progress: 0,
    };

    setDatasets([...datasets, datasetWithId]);
    setShowCreateDataset(false);

    // Simulate processing progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;

      if (progress >= 100) {
        clearInterval(interval);

        setDatasets(prevDatasets =>
          prevDatasets.map(ds =>
            ds.id === datasetWithId.id
              ? {
                  ...ds,
                  status: 'processed',
                  documentCount: Math.floor(Math.random() * 100) + 20,
                  size: `${(Math.random() * 5).toFixed(1)} MB`,
                  updatedAt: new Date(),
                }
              : ds
          )
        );
      } else {
        setDatasets(prevDatasets =>
          prevDatasets.map(ds => (ds.id === datasetWithId.id ? { ...ds, progress } : ds))
        );
      }
    }, 300);
  };

  // Handler for creating a new training task
  const handleCreateTask = newTask => {
    const taskWithId = {
      ...newTask,
      id: Date.now().toString(),
    };

    setTrainingTasks([...trainingTasks, taskWithId]);
    setShowCreateTask(false);

    // If task status is queued, simulate it starting after a delay
    if (taskWithId.status === 'queued') {
      setTimeout(() => {
        setTrainingTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskWithId.id ? { ...task, status: 'in_progress' } : task
          )
        );

        // Simulate progress for in_progress tasks
        let progress = 0;
        const interval = setInterval(() => {
          progress += 2;

          if (progress >= 100) {
            clearInterval(interval);

            setTrainingTasks(prevTasks =>
              prevTasks.map(task =>
                task.id === taskWithId.id
                  ? {
                      ...task,
                      status: 'completed',
                      progress: 100,
                      completedAt: new Date(),
                    }
                  : task
              )
            );
          } else {
            setTrainingTasks(prevTasks =>
              prevTasks.map(task => (task.id === taskWithId.id ? { ...task, progress } : task))
            );
          }
        }, 500);
      }, 2000);
    }
  };

  // Handler for editing a dataset
  const handleEditDataset = datasetId => {
    // In a real app, this would navigate to the dataset edit view
    console.log(`Edit dataset ${datasetId}`);
  };

  // Handler for deleting a dataset
  const handleDeleteDataset = datasetId => {
    setDatasets(datasets.filter(dataset => dataset.id !== datasetId));
  };

  // Handler for viewing dataset details
  const handleViewDataset = datasetId => {
    // In a real app, this would navigate to the dataset detail view
    console.log(`View dataset ${datasetId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">AI Agent Training</h1>
        <div className="flex items-center gap-2">
          {activeTab === 'datasets' ? (
            <Button onClick={() => setShowCreateDataset(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Dataset
            </Button>
          ) : (
            <Button onClick={() => setShowCreateTask(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Training Task
            </Button>
          )}
        </div>
      </div>

      {showCreateDataset ? (
        <CreateDatasetForm
          onCancel={() => setShowCreateDataset(false)}
          onCreate={handleCreateDataset}
        />
      ) : showCreateTask ? (
        <CreateTrainingTaskForm
          onCancel={() => setShowCreateTask(false)}
          onCreate={handleCreateTask}
          datasets={datasets.filter(d => d.status === 'processed')}
        />
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full sm:w-auto mb-4">
              <TabsTrigger value="datasets" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Datasets
              </TabsTrigger>
              <TabsTrigger value="training" className="flex-1">
                <BrainCircuit className="h-4 w-4 mr-2" />
                Training Tasks
              </TabsTrigger>
              <TabsTrigger value="models" className="flex-1">
                <Sparkles className="h-4 w-4 mr-2" />
                Trained Models
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={
                    activeTab === 'datasets'
                      ? 'Search datasets...'
                      : activeTab === 'training'
                      ? 'Search training tasks...'
                      : 'Search models...'
                  }
                  className="pl-8"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <TabsContent value="datasets">
              {filteredDatasets.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No datasets found</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by creating your first dataset
                  </p>
                  <Button onClick={() => setShowCreateDataset(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Dataset
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDatasets.map(dataset => (
                    <DatasetCard
                      key={dataset.id}
                      dataset={dataset}
                      onEdit={handleEditDataset}
                      onDelete={handleDeleteDataset}
                      onView={handleViewDataset}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="training">
              {viewingTaskId ? (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Training Task Details</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setViewingTaskId(null)}>
                        <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
                        Back to List
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">
                          {trainingTasks.find(t => t.id === viewingTaskId)?.name || 'Task Details'}
                        </h2>
                        <Badge
                          className={
                            trainingTasks.find(t => t.id === viewingTaskId)?.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : trainingTasks.find(t => t.id === viewingTaskId)?.status ===
                                'in_progress'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                          }
                        >
                          {trainingTasks
                            .find(t => t.id === viewingTaskId)
                            ?.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {trainingTasks.find(t => t.id === viewingTaskId)?.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Agent</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <BotIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {trainingTasks.find(t => t.id === viewingTaskId)?.agentName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Agent ID: {trainingTasks.find(t => t.id === viewingTaskId)?.agentId}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Datasets Used</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {trainingTasks
                              .find(t => t.id === viewingTaskId)
                              ?.datasets.map(datasetId => {
                                const dataset = datasets.find(d => d.id === datasetId);
                                return dataset ? (
                                  <div
                                    key={datasetId}
                                    className="flex items-center justify-between border rounded-md p-2"
                                  >
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4 text-muted-foreground" />
                                      <p className="text-sm font-medium">{dataset.name}</p>
                                    </div>
                                    <Badge variant="outline">{dataset.documentCount} docs</Badge>
                                  </div>
                                ) : null;
                              })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Training Progress</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Overall Progress</p>
                            <p className="text-sm">
                              {trainingTasks.find(t => t.id === viewingTaskId)?.progress || 0}%
                            </p>
                          </div>
                          <Progress
                            value={trainingTasks.find(t => t.id === viewingTaskId)?.progress || 0}
                            className="h-2"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm">Started</p>
                            <p className="text-sm">
                              {trainingTasks
                                .find(t => t.id === viewingTaskId)
                                ?.createdAt.toLocaleString()}
                            </p>
                          </div>
                          {trainingTasks.find(t => t.id === viewingTaskId)?.completedAt && (
                            <div className="flex items-center justify-between">
                              <p className="text-sm">Completed</p>
                              <p className="text-sm">
                                {trainingTasks
                                  .find(t => t.id === viewingTaskId)
                                  ?.completedAt.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>

                        {trainingTasks.find(t => t.id === viewingTaskId)?.status ===
                          'completed' && (
                          <div className="flex justify-end">
                            <Button>
                              <Bot className="h-4 w-4 mr-2" />
                              Use Trained Model
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <BrainCircuit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No training tasks found</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by creating your first training task
                  </p>
                  <Button onClick={() => setShowCreateTask(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Training Task
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.map(task => (
                    <TrainingTaskCard key={task.id} task={task} onViewDetails={setViewingTaskId} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="models">
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Trained Models</h3>
                <p className="text-muted-foreground mb-4">
                  Models created from your training tasks will appear here
                </p>
                <Button onClick={() => setActiveTab('training')}>
                  <BrainCircuit className="h-4 w-4 mr-2" />
                  Go to Training Tasks
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
