import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Export() {
  const { data: transactions = [] } = useTransactions();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(format(now, "yyyy-MM"));

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, i);
    return { value: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy") };
  });

  const handleExport = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(new Date(year, month - 1));

    const monthTx = transactions.filter((t) => {
      const d = parseISO(t.date);
      return d >= start && d <= end;
    });

    const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const savings = income - expense;

    const doc = new jsPDF();
    const monthLabel = format(start, "MMMM yyyy");

    // Title
    doc.setFontSize(20);
    doc.setTextColor(34, 139, 87);
    doc.text("Spendly", 14, 20);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Monthly Report — ${monthLabel}`, 14, 30);

    // Summary
    doc.setFontSize(11);
    doc.text(`Total Income: Rs. ${income.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 14, 45);
    doc.text(`Total Expenses: Rs. ${expense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 14, 52);
    doc.text(`Net Savings: Rs. ${savings.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 14, 59);

    // Category breakdown
    const catMap: Record<string, { income: number; expense: number }> = {};
    monthTx.forEach((t) => {
      const name = t.categories?.name || "Uncategorized";
      if (!catMap[name]) catMap[name] = { income: 0, expense: 0 };
      catMap[name][t.type as "income" | "expense"] += Number(t.amount);
    });

    if (Object.keys(catMap).length > 0) {
      doc.setFontSize(13);
      doc.text("Category Breakdown", 14, 72);
      autoTable(doc, {
        startY: 76,
        head: [["Category", "Income", "Expense"]],
        body: Object.entries(catMap).map(([name, v]) => [
          name,
          `Rs. ${v.income.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          `Rs. ${v.expense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [34, 139, 87] },
      });
    }

    // Transactions
    const finalY = (doc as any).lastAutoTable?.finalY || 90;
    doc.setFontSize(13);
    doc.text("All Transactions", 14, finalY + 10);
    autoTable(doc, {
      startY: finalY + 14,
      head: [["Date", "Description", "Category", "Type", "Amount"]],
      body: monthTx.map((t) => [
        format(parseISO(t.date), "MMM dd, yyyy"),
        t.description || "—",
        t.categories?.name || "—",
        t.type,
        `Rs. ${Number(t.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 139, 87] },
    });

    doc.save(`spendly-report-${selectedMonth}.pdf`);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Export Report</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly PDF Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select a month to generate a PDF report with your income, expenses, savings summary, category breakdown, and full transaction list.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
