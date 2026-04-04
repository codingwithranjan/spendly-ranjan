import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wallet,
  PieChart,
  TrendingUp,
  Shield,
  ArrowRight,
  BarChart3,
  FileText,
  Tag,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Smart Dashboard",
    description: "Visual analytics with pie, bar & line charts to understand your spending patterns.",
  },
  {
    icon: Tag,
    title: "Custom Categories",
    description: "Organize transactions with preset or custom categories tailored to your lifestyle.",
  },
  {
    icon: TrendingUp,
    title: "Budget Limits",
    description: "Set monthly spending caps per category and get visual alerts when you're close.",
  },
  {
    icon: FileText,
    title: "PDF Reports & Receipts",
    description: "Export monthly reports as PDFs and attach receipt photos to every transaction.",
  },
  {
    icon: PieChart,
    title: "Savings Goals & Recurring",
    description: "Set savings targets, auto-add recurring bills, and track progress visually.",
  },
  {
    icon: Shield,
    title: "AI Insights",
    description: "Get AI-powered spending analysis, tips, and personalized recommendations.",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Spendly</span>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth?mode=signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">
            Take Control of Your{" "}
            <span className="text-primary">Finances</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Track expenses, monitor savings, and get insights into your spending habits — all in one beautiful, simple app.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="text-base px-8">
              <Link to={user ? "/dashboard" : "/auth?mode=signup"}>
                {user ? "Open Dashboard" : "Start Free"} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {!user && (
              <Button size="lg" variant="outline" asChild className="text-base px-8">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-2 text-center text-3xl font-bold">Everything You Need</h2>
          <p className="mb-12 text-center text-muted-foreground">
            Powerful features to help you manage your money effortlessly.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="group transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-1 text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="rounded-2xl bg-primary/5 p-8 md:p-12">
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">
              Ready to Start Saving?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Join Spendly today and take the first step towards financial clarity.
            </p>
            <Button size="lg" asChild className="text-base px-8">
              <Link to={user ? "/dashboard" : "/auth?mode=signup"}>
                {user ? "Go to Dashboard" : "Create Free Account"} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Spendly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
