import { useState } from "react";
import { useTransactions, Transaction } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { format, parseISO } from "date-fns";
import TransactionDialog from "@/components/TransactionDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Transactions() {
  const { data: transactions = [], deleteTransaction } = useTransactions();
  const { data: categories = [] } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | undefined>();
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = transactions.filter((t) => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterCategory !== "all" && t.category_id !== filterCategory) return false;
    if (search && !t.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleEdit = (tx: Transaction) => {
    setEditTx(tx);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditTx(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search description..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No transactions found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="whitespace-nowrap">{format(parseISO(tx.date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>{tx.description || "—"}</TableCell>
                      <TableCell>{tx.categories?.name || "—"}</TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tx.type === "income" ? "bg-secondary text-secondary-foreground" : "bg-destructive/10 text-destructive"}`}>
                          {tx.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium" style={{ color: tx.type === "income" ? "hsl(var(--income))" : "hsl(var(--expense))" }}>
                        {tx.type === "income" ? "+" : "-"}₹{Number(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(tx)}>
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
                                <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteTransaction.mutate(tx.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDialog open={dialogOpen} onOpenChange={handleDialogClose} transaction={editTx} />
    </div>
  );
}
