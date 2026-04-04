import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type SavingsGoal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  icon: string;
  created_at: string;
};

export function useSavingsGoals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["savings_goals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("savings_goals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SavingsGoal[];
    },
    enabled: !!user,
  });

  const addGoal = useMutation({
    mutationFn: async (g: { name: string; target_amount: number; current_amount?: number; target_date?: string; icon?: string }) => {
      const { error } = await supabase.from("savings_goals").insert({ ...g, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings_goals"] });
      toast.success("Goal created!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, ...g }: { id: string; name?: string; target_amount?: number; current_amount?: number; target_date?: string; icon?: string }) => {
      const { error } = await supabase.from("savings_goals").update(g).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings_goals"] });
      toast.success("Goal updated!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("savings_goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings_goals"] });
      toast.success("Goal deleted!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { ...query, addGoal, updateGoal, deleteGoal };
}
