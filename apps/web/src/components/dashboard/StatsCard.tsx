import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  variant?: "primary" | "accent" | "success" | "danger";
  trend?: string;
  trendIcon?: LucideIcon;
}

const VARIANTS = {
  primary: {
    border: "hover:border-primary-500/50",
    shadow: "hover:shadow-primary-500/10",
    bg: "bg-primary-500/5",
    iconBg: "bg-primary-500/10",
    iconBorder: "border-primary-500/20",
    iconColor: "text-primary-400",
  },
  accent: {
    border: "hover:border-accent-500/50",
    shadow: "hover:shadow-accent-500/10",
    bg: "bg-accent-500/5",
    iconBg: "bg-accent-500/10",
    iconBorder: "border-accent-500/20",
    iconColor: "text-accent-400",
  },
  success: {
    border: "hover:border-green-500/50",
    shadow: "hover:shadow-green-500/10",
    bg: "bg-green-500/5",
    iconBg: "bg-green-500/10",
    iconBorder: "border-green-500/20",
    iconColor: "text-green-400",
  },
  danger: {
    border: "hover:border-danger-500/50",
    shadow: "hover:shadow-danger-500/10",
    bg: "bg-danger-500/5",
    iconBg: "bg-danger-500/10",
    iconBorder: "border-danger-500/20",
    iconColor: "text-danger-500",
  },
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "primary",
  trend,
  trendIcon: TrendIcon = TrendingUp,
}: StatsCardProps) {
  const styles = VARIANTS[variant];

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-base-700/50 transition-all duration-300 hover:shadow-lg",
        styles.border,
        styles.shadow
      )}
    >
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl",
          styles.bg
        )}
      />
      <CardHeader className="pb-3">
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-neutral-300 uppercase tracking-wide">
            {title}
          </CardTitle>
          <div
            className={cn(
              "p-2 rounded-lg border",
              styles.iconBg,
              styles.iconBorder
            )}
          >
            <Icon className={cn("h-5 w-5", styles.iconColor)} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          {trend ? (
             <div className={cn("text-xs font-medium px-2 py-1 rounded", styles.iconBg, styles.iconColor)}> {/* Reusing styles for simplicity, can customize */}
                {trend}
             </div>
          ) : (
            <TrendIcon className={cn("h-4 w-4", styles.iconColor)} />
          )}
        </div>
        <p className="text-sm text-neutral-400 mt-2">{description}</p>
      </CardContent>
    </Card>
  );
}
