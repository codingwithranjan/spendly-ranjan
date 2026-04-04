import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { useTransactions, Transaction } from "@/hooks/useTransactions";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
}

export default function TransactionDialog({ open, onOpenChange, transaction }: Props) {
  const { data: categories = [] } = useCategories();
  const { addTransaction, updateTransaction } = useTransactions();
  const { user } = useAuth();
  const isEdit = !!transaction;
  const fileRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState(transaction?.type || "expense");
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : "");
  const [categoryId, setCategoryId] = useState(transaction?.category_id || "");
  const [description, setDescription] = useState(transaction?.description || "");
  const [date, setDate] = useState(transaction?.date || format(new Date(), "yyyy-MM-dd"));
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(
    (transaction as any)?.receipt_url || null
  );
  const [uploading, setUploading] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const uploadReceipt = async (): Promise<string | null> => {
    if (!receiptFile || !user) return receiptPreview;
    const ext = receiptFile.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("receipts").upload(path, receiptFile);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let receiptUrl = receiptPreview;
      if (receiptFile) {
        receiptUrl = await uploadReceipt();
      }

      const payload: any = {
        amount: parseFloat(amount),
        type,
        category_id: categoryId || null,
        description,
        date,
        receipt_url: receiptUrl,
      };

      if (isEdit) {
        await updateTransaction.mutateAsync({ id: transaction.id, ...payload });
      } else {
        await addTransaction.mutateAsync(payload);
      }
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setType("expense");
    setAmount("");
    setCategoryId("");
    setDescription("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setReceiptFile(null);
    setReceiptPreview(null);
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

          {/* Receipt Upload */}
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Receipt (optional)</p>
            {receiptPreview ? (
              <div className="relative inline-block">
                <img src={receiptPreview} alt="Receipt" className="h-24 w-24 rounded-lg border object-cover" />
                <button
                  type="button"
                  onClick={() => { setReceiptFile(null); setReceiptPreview(null); }}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-2">
                <Camera className="h-4 w-4" /> Attach Receipt
              </Button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          </div>

          <Button type="submit" className="w-full" disabled={addTransaction.isPending || updateTransaction.isPending || uploading}>
            {uploading ? "Uploading..." : isEdit ? "Update" : "Add"} Transaction
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
