import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LayoutDashboard, ArrowLeftRight, Tag, FileText, User, LogOut, Wallet, RefreshCw, PiggyBank, Target, Sparkles, Moon, Sun, MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { to: "/categories", icon: Tag, label: "Categories" },
  { to: "/budgets", icon: PiggyBank, label: "Budgets" },
  { to: "/recurring", icon: RefreshCw, label: "Recurring" },
  { to: "/savings", icon: Target, label: "Goals" },
  { to: "/insights", icon: Sparkles, label: "Insights" },
  { to: "/export", icon: FileText, label: "Export" },
  { to: "/profile", icon: User, label: "Profile" },
];

const mobileMainNav = navItems.slice(0, 4);
const mobileMoreNav = navItems.slice(4);

export default function AppLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="flex w-64 flex-col border-r bg-card p-4">
          <div className="mb-8 flex items-center gap-2 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Spendly</span>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  location.pathname === item.to
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto space-y-1">
            <Button variant="ghost" onClick={toggleTheme} className="w-full justify-start gap-3 text-muted-foreground">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </Button>
            <Button variant="ghost" onClick={signOut} className="w-full justify-start gap-3 text-muted-foreground">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-6xl p-4 md:p-6">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <>
          {/* More menu overlay */}
          {moreOpen && (
            <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMoreOpen(false)}>
              <div
                className="absolute bottom-16 left-0 right-0 rounded-t-2xl border-t bg-card p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">More</span>
                  <button onClick={() => setMoreOpen(false)}>
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {mobileMoreNav.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium transition-colors",
                        location.pathname === item.to
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => { toggleTheme(); setMoreOpen(false); }}
                    className="flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium text-muted-foreground"
                  >
                    {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    {theme === "dark" ? "Light" : "Dark"}
                  </button>
                  <button
                    onClick={() => { signOut(); setMoreOpen(false); }}
                    className="flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium text-muted-foreground"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

          <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t bg-card">
            {mobileMainNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
                  location.pathname === item.to
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
                mobileMoreNav.some((i) => location.pathname === i.to)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              More
            </button>
          </nav>
        </>
      )}
    </div>
  );
}
