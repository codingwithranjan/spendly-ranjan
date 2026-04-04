import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type RecurringTransaction = {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  type: string;
  description: string | null;
  frequency: string;
  next_date: string;
  is_active: boolean;
  created_at: string;
  categories?: { name: string; icon: string } | null;
};

export function useRecurringTransactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["recurring_transactions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recurring_transactions")
        .select("*, categories(name, icon)")
        .order("next_date", { ascending: true });
      if (error) throw error;
      return data as RecurringTransaction[];
    },
    enabled: !!user,
  });

  const addRecurring = useMutation({
    mutationFn: async (tx: { amount: number; type: string; category_id: string | null; description: string; frequency: string; next_date: string }) => {
      const { error } = await supabase.from("recurring_transactions").insert({ ...tx, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring_transactions"] });
      toast.success("Recurring transaction added!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateRecurring = useMutation({
    mutationFn: async ({ id, ...tx }: { id: string; amount: number; type: string; category_id: string | null; description: string; frequency: string; next_date: string; is_active: boolean }) => {
      const { error } = await supabase.from("recurring_transactions").update(tx).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring_transactions"] });
      toast.success("Updated!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteRecurring = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recurring_transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring_transactions"] });
      toast.success("Deleted!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { ...query, addRecurring, updateRecurring, deleteRecurring };
}
