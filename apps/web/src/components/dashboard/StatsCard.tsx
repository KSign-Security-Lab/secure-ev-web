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
    border: "hover:border-blue-200",
    shadow: "",
    iconBg: "bg-blue-50",
    iconBorder: "border-blue-200",
    iconColor: "text-blue-700",
  },
  accent: {
    border: "hover:border-sky-200",
    shadow: "",
    iconBg: "bg-sky-50",
    iconBorder: "border-sky-200",
    iconColor: "text-sky-700",
  },
  success: {
    border: "hover:border-green-200",
    shadow: "",
    iconBg: "bg-green-50",
    iconBorder: "border-green-200",
    iconColor: "text-green-700",
  },
  danger: {
    border: "hover:border-rose-200",
    shadow: "",
    iconBg: "bg-rose-50",
    iconBorder: "border-rose-200",
    iconColor: "text-rose-700",
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
        "relative overflow-hidden border-neutral-200 transition-all duration-300 hover:shadow-sm",
        styles.border,
        styles.shadow
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
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
          <div className="text-3xl font-bold text-neutral-950">
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
        <p className="text-sm text-neutral-500 mt-2">{description}</p>
      </CardContent>
    </Card>
  );
}
