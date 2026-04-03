import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type Category = {
  id: string;
  user_id: string | null;
  name: string;
  type: string;
  icon: string;
  is_default: boolean;
};

export function useCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["categories", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("is_default", { ascending: false })
        .order("name");
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user,
  });

  const addCategory = useMutation({
    mutationFn: async (cat: { name: string; type: string; icon: string }) => {
      const { error } = await supabase.from("categories").insert({ ...cat, user_id: user!.id, is_default: false });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category added!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...cat }: { id: string; name: string; type: string; icon: string }) => {
      const { error } = await supabase.from("categories").update(cat).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { ...query, addCategory, updateCategory, deleteCategory };
}
