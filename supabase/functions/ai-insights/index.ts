import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transactions } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Missing API key");

    const totalIncome = transactions.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + t.amount, 0);
    const totalExpense = transactions.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + t.amount, 0);

    const categorySpending: Record<string, number> = {};
    transactions.filter((t: any) => t.type === "expense").forEach((t: any) => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });

    const prompt = `You are a personal finance advisor. Analyze this user's spending data and provide actionable insights.

Data Summary:
- Total Income: ₹${totalIncome.toLocaleString("en-IN")}
- Total Expenses: ₹${totalExpense.toLocaleString("en-IN")}
- Net Savings: ₹${(totalIncome - totalExpense).toLocaleString("en-IN")}
- Category Breakdown: ${JSON.stringify(categorySpending)}
- Recent Transactions (last ${transactions.length}): ${JSON.stringify(transactions.slice(0, 30))}

Provide:
1. 📊 **Spending Summary** - Brief overview
2. ⚠️ **Areas of Concern** - Categories where spending seems high
3. 💡 **Saving Tips** - 3-5 actionable tips specific to their spending
4. 🎯 **Recommended Budget** - Suggested monthly limits per category
5. 📈 **Trend Analysis** - Any patterns you notice

Keep it concise, friendly, and use INR (₹). Use emojis for readability.`;

    const response = await fetch("https://lovable.dev/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`AI API error: ${err}`);
    }

    const result = await response.json();
    const insight = result.choices?.[0]?.message?.content || "No insights generated.";

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
