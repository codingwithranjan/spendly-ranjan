import { useState } from "react";
import { useRecurringTransactions, RecurringTransaction } from "@/hooks/useRecurringTransactions";
import { useCategories } from "@/hooks/useCategories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export default function Recurring() {
  const { data: items = [], addRecurring, updateRecurring, deleteRecurring } = useRecurringTransactions();
  const { data: categories = [] } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<RecurringTransaction | undefined>();

  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [nextDate, setNextDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const filteredCategories = categories.filter((c) => c.type === type);

  const openCreate = () => {
    setEditItem(undefined);
    setType("expense");
    setAmount("");
    setCategoryId("");
    setDescription("");
    setFrequency("monthly");
    setNextDate(format(new Date(), "yyyy-MM-dd"));
    setDialogOpen(true);
  };

  const openEdit = (item: RecurringTransaction) => {
    setEditItem(item);
    setType(item.type);
    setAmount(String(item.amount));
    setCategoryId(item.category_id || "");
    setDescription(item.description || "");
    setFrequency(item.frequency);
    setNextDate(item.next_date);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      amount: parseFloat(amount),
      type,
      category_id: categoryId || null,
      description,
      frequency,
      next_date: nextDate,
    };
    if (editItem) {
      await updateRecurring.mutateAsync({ id: editItem.id, ...payload, is_active: editItem.is_active });
    } else {
      await addRecurring.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const toggleActive = (item: RecurringTransaction) => {
    updateRecurring.mutate({
      id: item.id,
      amount: Number(item.amount),
      type: item.type,
      category_id: item.category_id,
      description: item.description || "",
      frequency: item.frequency,
      next_date: item.next_date,
      is_active: !item.is_active,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recurring Transactions</h1>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Recurring Bills & Income</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No recurring transactions yet</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.description || "Untitled"}</span>
                      <Badge variant={item.type === "income" ? "secondary" : "destructive"} className="text-xs">
                        {item.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <RefreshCw className="mr-1 h-3 w-3" />
                        {item.frequency}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {item.categories?.name || "No category"} · Next: {format(new Date(item.next_date), "MMM dd, yyyy")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold" style={{ color: item.type === "income" ? "hsl(var(--income))" : "hsl(var(--expense))" }}>
                      ₹{Number(item.amount).toLocaleString("en-IN")}
                    </span>
                    <Switch checked={item.is_active} onCheckedChange={() => toggleActive(item)} />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
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
                          <AlertDialogTitle>Delete recurring transaction?</AlertDialogTitle>
                          <AlertDialogDescription>This won't affect past transactions.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteRecurring.mutate(item.id)}>Delete</AlertDialogAction>
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
            <DialogTitle>{editItem ? "Edit Recurring" : "Add Recurring Transaction"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Button type="button" variant={type === "expense" ? "default" : "outline"} className="flex-1" onClick={() => setType("expense")}>Expense</Button>
              <Button type="button" variant={type === "income" ? "default" : "outline"} className="flex-1" onClick={() => setType("income")}>Income</Button>
            </div>
            <Input type="number" step="0.01" min="0.01" placeholder="Amount" required value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {filteredCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Description (e.g. Netflix, Rent)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
            <Button type="submit" className="w-full">{editItem ? "Update" : "Add"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
