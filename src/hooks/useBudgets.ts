import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type Budget = {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: number;
  year: number;
  categories?: { name: string; icon: string } | null;
};

export function useBudgets(month?: number, year?: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();

  const query = useQuery({
    queryKey: ["budgets", user?.id, m, y],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*, categories(name, icon)")
        .eq("month", m)
        .eq("year", y);
      if (error) throw error;
      return data as Budget[];
    },
    enabled: !!user,
  });

  const upsertBudget = useMutation({
    mutationFn: async (b: { category_id: string; amount: number; month: number; year: number }) => {
      const { error } = await supabase.from("budgets").upsert(
        { ...b, user_id: user!.id },
        { onConflict: "user_id,category_id,month,year" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget saved!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("budgets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget removed!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { ...query, upsertBudget, deleteBudget };
}
