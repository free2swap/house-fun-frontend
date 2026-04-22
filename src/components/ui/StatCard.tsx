import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function StatCard({
    title,
    value,
    description,
    trend,
    icon: Icon,
    className
}: {
    title: string
    value: string
    description?: string
    trend?: 'up' | 'down' | 'neutral'
    icon?: any
    className?: string
}) {
    return (
        <div className={cn(
            "relative overflow-hidden bg-zinc-900/40 border border-zinc-800 rounded-[1.5rem] p-4 sm:p-5 group transition-all active:scale-[0.98]",
            className
        )}>
            {/* Background Glow */}
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/5 blur-2xl rounded-full" />
            
            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none flex items-center">
                        {title}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tighter leading-none py-1">
                        {value}
                    </h3>
                </div>
                {Icon && (
                    <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-500 group-hover:text-emerald-400 transition-colors">
                        <Icon className="w-4 h-4" />
                    </div>
                )}
            </div>

            {(description || trend) && (
                <div className="mt-3 flex items-center space-x-1.5 relative z-10">
                    {trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                    {trend === 'down' && <TrendingDown className="w-3 h-3 text-rose-500" />}
                    {trend === 'neutral' && <Minus className="w-3 h-3 text-zinc-500" />}
                    <span className={cn(
                        "text-[9px] font-bold uppercase",
                        trend === 'up' ? "text-emerald-500" : trend === 'down' ? "text-rose-500" : "text-zinc-500"
                    )}>
                        {description}
                    </span>
                </div>
            )}
        </div>
    );
}
