import { useState } from "react";
import { useSavingsGoals, SavingsGoal } from "@/hooks/useSavingsGoals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Plus, Pencil, Trash2, Target, Plane, Home, GraduationCap, Car, Gift } from "lucide-react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const GOAL_ICONS: Record<string, any> = { target: Target, plane: Plane, home: Home, "graduation-cap": GraduationCap, car: Car, gift: Gift };
const ICON_OPTIONS = Object.keys(GOAL_ICONS);

export default function SavingsGoals() {
  const { data: goals = [], addGoal, updateGoal, deleteGoal } = useSavingsGoals();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<SavingsGoal | undefined>();
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [icon, setIcon] = useState("target");

  const openCreate = () => {
    setEditGoal(undefined);
    setName("");
    setTargetAmount("");
    setCurrentAmount("0");
    setTargetDate("");
    setIcon("target");
    setDialogOpen(true);
  };

  const openEdit = (g: SavingsGoal) => {
    setEditGoal(g);
    setName(g.name);
    setTargetAmount(String(g.target_amount));
    setCurrentAmount(String(g.current_amount));
    setTargetDate(g.target_date || "");
    setIcon(g.icon);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      target_amount: parseFloat(targetAmount),
      current_amount: parseFloat(currentAmount || "0"),
      target_date: targetDate || undefined,
      icon,
    };
    if (editGoal) {
      await updateGoal.mutateAsync({ id: editGoal.id, ...payload });
    } else {
      await addGoal.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const addFunds = async (goal: SavingsGoal, extraAmount: number) => {
    await updateGoal.mutateAsync({
      id: goal.id,
      current_amount: Number(goal.current_amount) + extraAmount,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Savings Goals</h1>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1 h-4 w-4" /> New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No savings goals yet. Create one to start tracking!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((g) => {
            const pct = Math.min((Number(g.current_amount) / Number(g.target_amount)) * 100, 100);
            const IconComp = GOAL_ICONS[g.icon] || Target;
            const isComplete = Number(g.current_amount) >= Number(g.target_amount);

            return (
              <Card key={g.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <IconComp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{g.name}</CardTitle>
                      {g.target_date && (
                        <p className="text-xs text-muted-foreground">
                          Target: {format(new Date(g.target_date), "MMM dd, yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(g)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
                          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteGoal.mutate(g.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-end justify-between text-sm">
                    <span className="text-muted-foreground">
                      ₹{Number(g.current_amount).toLocaleString("en-IN")} of ₹{Number(g.target_amount).toLocaleString("en-IN")}
                    </span>
                    <span className="font-medium" style={{ color: isComplete ? "hsl(var(--income))" : "hsl(var(--savings))" }}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={pct} className="h-2.5" />
                  {!isComplete && (
                    <div className="flex gap-2">
                      {[500, 1000, 5000].map((amt) => (
                        <Button key={amt} variant="outline" size="sm" className="text-xs" onClick={() => addFunds(g, amt)}>
                          +₹{amt.toLocaleString("en-IN")}
                        </Button>
                      ))}
                    </div>
                  )}
                  {isComplete && (
                    <p className="text-sm font-medium" style={{ color: "hsl(var(--income))" }}>🎉 Goal reached!</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editGoal ? "Edit Goal" : "Create Savings Goal"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Goal name (e.g. Vacation, New Car)" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input type="number" step="0.01" min="1" placeholder="Target amount (₹)" required value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
            <Input type="number" step="0.01" min="0" placeholder="Saved so far (₹)" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} />
            <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Icon</p>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((i) => {
                  const IC = GOAL_ICONS[i];
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIcon(i)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${icon === i ? "border-primary bg-primary/10" : "hover:bg-accent"}`}
                    >
                      <IC className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>
            <Button type="submit" className="w-full">{editGoal ? "Update" : "Create"} Goal</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
