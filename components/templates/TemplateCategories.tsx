import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/sonner';
import { Palette, PlusCircle, MoreVertical, Pencil, Trash2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  templateCount: number;
  createdAt: Date;
}

export function TemplateCategories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<TemplateCategory[]>([
    {
      id: 'cat-1',
      name: 'Marketing',
      description: 'Templates for marketing campaigns',
      color: '#FF5733',
      templateCount: 8,
      createdAt: new Date('2023-05-10'),
    },
    {
      id: 'cat-2',
      name: 'Onboarding',
      description: 'Templates for new customers',
      color: '#33A1FF',
      templateCount: 5,
      createdAt: new Date('2023-06-15'),
    },
    {
      id: 'cat-3',
      name: 'Newsletters',
      description: 'Newsletter templates',
      color: '#33FF57',
      templateCount: 12,
      createdAt: new Date('2023-04-22'),
    },
    {
      id: 'cat-4',
      name: 'Transactional',
      description: 'Order confirmations, receipts, etc.',
      color: '#C133FF',
      templateCount: 7,
      createdAt: new Date('2023-08-03'),
    },
    {
      id: 'cat-5',
      name: 'Event',
      description: 'Event invitations and reminders',
      color: '#FFD133',
      templateCount: 4,
      createdAt: new Date('2023-09-12'),
    },
  ]);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TemplateCategory | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#6366f1',
  });

  const handleCreateCategory = () => {
    if (!newCategory.name) {
      toast({
        title: 'Category name required',
        description: 'Please provide a name for the category',
        variant: 'destructive',
      });
      return;
    }

    const category: TemplateCategory = {
      id: `cat-${Date.now()}`,
      name: newCategory.name,
      description: newCategory.description,
      color: newCategory.color,
      templateCount: 0,
      createdAt: new Date(),
    };

    setCategories([...categories, category]);
    setNewCategory({ name: '', description: '', color: '#6366f1' });
    setOpenCreateDialog(false);

    toast({
      title: 'Category created',
      description: `${category.name} has been created successfully.`,
    });
  };

  const handleEditCategory = () => {
    if (!editingCategory) return;

    setCategories(
      categories.map(category => (category.id === editingCategory.id ? editingCategory : category))
    );
    setEditingCategory(null);
    setOpenEditDialog(false);

    toast({
      title: 'Category updated',
      description: `${editingCategory.name} has been updated successfully.`,
    });
  };

  const handleDeleteCategory = (id: string) => {
    const categoryToDelete = categories.find(cat => cat.id === id);

    if (categoryToDelete?.templateCount && categoryToDelete.templateCount > 0) {
      toast({
        title: 'Cannot delete category',
        description: `This category contains ${categoryToDelete.templateCount} templates. Please reassign or delete them first.`,
        variant: 'destructive',
      });
      return;
    }

    setCategories(categories.filter(category => category.id !== id));

    toast({
      title: 'Category deleted',
      description: 'The category has been deleted successfully.',
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Template Categories</h1>
          <p className="text-muted-foreground">Organize and manage your template categories</p>
        </div>
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
              <PlusCircle className="h-4 w-4" />
              Create Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
              <DialogDescription>
                Add a new template category to organize your templates.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g., Marketing"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newCategory.description}
                  onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="e.g., Templates for marketing campaigns"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2 items-center">
                  <div
                    className="w-8 h-8 rounded-full border"
                    style={{ backgroundColor: newCategory.color }}
                  ></div>
                  <Input
                    id="color"
                    type="color"
                    value={newCategory.color}
                    onChange={e => setNewCategory({ ...newCategory, color: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCategory}>Create Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Category Management</CardTitle>
          <CardDescription>Manage your template categories and their settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Templates</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map(category => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{category.description}</TableCell>
                  <TableCell className="text-center">{category.templateCount}</TableCell>
                  <TableCell>{category.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingCategory(category);
                            setOpenEditDialog(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category details.</DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Category Name</Label>
                <Input
                  id="edit-name"
                  value={editingCategory.name}
                  onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingCategory.description}
                  onChange={e =>
                    setEditingCategory({ ...editingCategory, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <div className="flex gap-2 items-center">
                  <div
                    className="w-8 h-8 rounded-full border"
                    style={{ backgroundColor: editingCategory.color }}
                  ></div>
                  <Input
                    id="edit-color"
                    type="color"
                    value={editingCategory.color}
                    onChange={e =>
                      setEditingCategory({ ...editingCategory, color: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory}>Update Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
