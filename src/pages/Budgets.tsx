import { useState, useMemo } from "react";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { useTransactions } from "@/hooks/useTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";

export default function Budgets() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: budgets = [], upsertBudget, deleteBudget } = useBudgets(month, year);
  const { data: categories = [] } = useCategories();
  const { data: transactions = [] } = useTransactions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");

  const expenseCategories = categories.filter((c) => c.type === "expense");

  const spending = useMemo(() => {
    const ms = startOfMonth(now);
    const me = endOfMonth(now);
    const map: Record<string, number> = {};
    transactions.filter((t) => {
      const d = parseISO(t.date);
      return t.type === "expense" && d >= ms && d <= me;
    }).forEach((t) => {
      if (t.category_id) {
        map[t.category_id] = (map[t.category_id] || 0) + Number(t.amount);
      }
    });
    return map;
  }, [transactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertBudget.mutateAsync({
      category_id: categoryId,
      amount: parseFloat(amount),
      month,
      year,
    });
    setDialogOpen(false);
    setCategoryId("");
    setAmount("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Set Budget
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Monthly Budget Limits — {now.toLocaleString("default", { month: "long", year: "numeric" })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No budgets set for this month</p>
          ) : (
            <div className="space-y-4">
              {budgets.map((b) => {
                const spent = spending[b.category_id] || 0;
                const pct = Math.min((spent / Number(b.amount)) * 100, 100);
                const overBudget = spent > Number(b.amount);

                return (
                  <div key={b.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{b.categories?.name || "Category"}</span>
                        {overBudget && <AlertTriangle className="h-4 w-4 text-destructive" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          ₹{spent.toLocaleString("en-IN")} / ₹{Number(b.amount).toLocaleString("en-IN")}
                        </span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteBudget.mutate(b.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <Progress
                      value={pct}
                      className="h-2.5"
                      style={{
                        // @ts-ignore
                        "--progress-foreground": overBudget
                          ? "hsl(var(--expense))"
                          : pct > 80
                          ? "hsl(45,93%,47%)"
                          : "hsl(var(--income))",
                      } as React.CSSProperties}
                    />
                    {overBudget && (
                      <p className="mt-1 text-xs text-destructive">
                        Over budget by ₹{(spent - Number(b.amount)).toLocaleString("en-IN")}!
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Monthly Budget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Select expense category" /></SelectTrigger>
              <SelectContent>
                {expenseCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" step="0.01" min="1" placeholder="Budget limit (₹)" required value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Button type="submit" className="w-full" disabled={!categoryId || upsertBudget.isPending}>
              Save Budget
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
