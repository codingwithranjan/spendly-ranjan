import { useMemo, useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, PiggyBank, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns";
import TransactionDialog from "@/components/TransactionDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLORS = ["hsl(152,60%,36%)", "hsl(217,91%,60%)", "hsl(0,84%,60%)", "hsl(45,93%,47%)", "hsl(280,60%,50%)", "hsl(30,80%,55%)", "hsl(190,70%,45%)", "hsl(330,60%,50%)"];

export default function Dashboard() {
  const { data: transactions = [] } = useTransactions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  const now = new Date();
  const periodStart = selectedPeriod === "current" ? startOfMonth(now) : startOfMonth(subMonths(now, 1));
  const periodEnd = selectedPeriod === "current" ? endOfMonth(now) : endOfMonth(subMonths(now, 1));

  const periodTx = useMemo(
    () => transactions.filter((t) => {
      const d = parseISO(t.date);
      return d >= periodStart && d <= periodEnd;
    }),
    [transactions, periodStart, periodEnd]
  );

  const income = periodTx.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expense = periodTx.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const savings = income - expense;

  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    periodTx.filter((t) => t.type === "expense").forEach((t) => {
      const name = t.categories?.name || "Uncategorized";
      map[name] = (map[name] || 0) + Number(t.amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [periodTx]);

  const barData = useMemo(() => {
    const months: { month: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const m = subMonths(now, i);
      const ms = startOfMonth(m);
      const me = endOfMonth(m);
      const mTx = transactions.filter((t) => {
        const d = parseISO(t.date);
        return d >= ms && d <= me;
      });
      months.push({
        month: format(m, "MMM"),
        income: mTx.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
        expense: mTx.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
      });
    }
    return months;
  }, [transactions]);

  const lineData = useMemo(() => {
    return barData.map((m) => ({ ...m, savings: m.income - m.expense }));
  }, [barData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your financial overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">This Month</SelectItem>
              <SelectItem value="last">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setDialogOpen(true)} size="sm">
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Income</CardTitle>
            <TrendingUp className="h-4 w-4" style={{ color: "hsl(var(--income))" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "hsl(var(--income))" }}>
              ₹{income.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
            <TrendingDown className="h-4 w-4" style={{ color: "hsl(var(--expense))" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "hsl(var(--expense))" }}>
              ₹{expense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Savings</CardTitle>
            <PiggyBank className="h-4 w-4" style={{ color: "hsl(var(--savings))" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: savings >= 0 ? "hsl(var(--income))" : "hsl(var(--expense))" }}>
              ₹{savings.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-muted-foreground">No expenses this period</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Income vs Expenses (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                <Legend />
                <Bar dataKey="income" fill="hsl(152,60%,36%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="hsl(0,84%,60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Savings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                <Line type="monotone" dataKey="savings" stroke="hsl(217,91%,60%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <TransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
