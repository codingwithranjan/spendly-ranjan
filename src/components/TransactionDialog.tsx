import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { useTransactions, Transaction } from "@/hooks/useTransactions";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
}

export default function TransactionDialog({ open, onOpenChange, transaction }: Props) {
  const { data: categories = [] } = useCategories();
  const { addTransaction, updateTransaction } = useTransactions();
  const isEdit = !!transaction;

  const [type, setType] = useState(transaction?.type || "expense");
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : "");
  const [categoryId, setCategoryId] = useState(transaction?.category_id || "");
  const [description, setDescription] = useState(transaction?.description || "");
  const [date, setDate] = useState(transaction?.date || format(new Date(), "yyyy-MM-dd"));

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      amount: parseFloat(amount),
      type,
      category_id: categoryId || null,
      description,
      date,
    };
    if (isEdit) {
      await updateTransaction.mutateAsync({ id: transaction.id, ...payload });
    } else {
      await addTransaction.mutateAsync(payload);
    }
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setType("expense");
    setAmount("");
    setCategoryId("");
    setDescription("");
    setDate(format(new Date(), "yyyy-MM-dd"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button type="button" variant={type === "expense" ? "default" : "outline"} className="flex-1" onClick={() => setType("expense")}>
              Expense
            </Button>
            <Button type="button" variant={type === "income" ? "default" : "outline"} className="flex-1" onClick={() => setType("income")}>
              Income
            </Button>
          </div>
          <Input type="number" step="0.01" min="0.01" placeholder="Amount" required value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button type="submit" className="w-full" disabled={addTransaction.isPending || updateTransaction.isPending}>
            {isEdit ? "Update" : "Add"} Transaction
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
