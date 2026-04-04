import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type Transaction = {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  type: string;
  description: string | null;
  date: string;
  created_at: string;
  receipt_url: string | null;
  categories?: { name: string; icon: string } | null;
};

export function useTransactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*, categories(name, icon)")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  const addTransaction = useMutation({
    mutationFn: async (tx: { amount: number; type: string; category_id: string | null; description: string; date: string; receipt_url?: string | null }) => {
      const { error } = await supabase.from("transactions").insert({ ...tx, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction added!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...tx }: { id: string; amount: number; type: string; category_id: string | null; description: string; date: string; receipt_url?: string | null }) => {
      const { error } = await supabase.from("transactions").update(tx).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction updated!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction deleted!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { ...query, addTransaction, updateTransaction, deleteTransaction };
}
