import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Insights() {
  const { data: transactions = [] } = useTransactions();
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    if (transactions.length === 0) {
      setInsight("Add some transactions first to get AI-powered insights!");
      return;
    }

    setLoading(true);
    try {
      const summary = transactions.slice(0, 100).map((t) => ({
        date: t.date,
        type: t.type,
        amount: Number(t.amount),
        category: t.categories?.name || "Uncategorized",
        description: t.description,
      }));

      const { data, error } = await supabase.functions.invoke("ai-insights", {
        body: { transactions: summary },
      });

      if (error) throw error;
      setInsight(data.insight);
    } catch (err: any) {
      setInsight("Failed to generate insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Insights</h1>
        <Button onClick={generateInsights} disabled={loading} size="sm">
          {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />}
          {loading ? "Analyzing..." : "Generate Insights"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Spending Analysis & Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insight ? (
            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
              {insight}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Sparkles className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Click "Generate Insights" to get AI-powered analysis of your spending patterns, saving tips, and personalized recommendations.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
