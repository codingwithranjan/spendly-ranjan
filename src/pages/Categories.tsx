import { useState } from "react";
import { useCategories, Category } from "@/hooks/useCategories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ICONS = ["circle", "utensils", "car", "zap", "film", "shopping-bag", "heart", "book-open", "briefcase", "laptop", "trending-up", "gift", "home", "plane", "coffee"];

export default function Categories() {
  const { data: categories = [], addCategory, updateCategory, deleteCategory } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | undefined>();
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [icon, setIcon] = useState("circle");

  const openCreate = () => {
    setEditCat(undefined);
    setName("");
    setType("expense");
    setIcon("circle");
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditCat(cat);
    setName(cat.name);
    setType(cat.type);
    setIcon(cat.icon);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editCat) {
      await updateCategory.mutateAsync({ id: editCat.id, name, type, icon });
    } else {
      await addCategory.mutateAsync({ name, type, icon });
    }
    setDialogOpen(false);
  };

  const defaultCats = categories.filter((c) => c.is_default);
  const customCats = categories.filter((c) => !c.is_default);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Add Custom
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {defaultCats.map((c) => (
              <Badge key={c.id} variant="secondary" className="px-3 py-1.5 text-sm">
                {c.name}
                <span className="ml-1.5 text-xs text-muted-foreground">({c.type})</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {customCats.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">No custom categories yet</p>
          ) : (
            <div className="space-y-2">
              {customCats.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <span className="font-medium">{c.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({c.type})</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete category?</AlertDialogTitle>
                          <AlertDialogDescription>Transactions using this category won't be deleted.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteCategory.mutate(c.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editCat ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Category name" required value={name} onChange={(e) => setName(e.target.value)} />
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ICONS.map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full">{editCat ? "Update" : "Add"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
