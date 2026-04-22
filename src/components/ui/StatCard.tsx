import { cn } from "@/lib/utils"

export function StatCard({
    title,
    value,
    description,
    trend,
    className
}: {
    title: string
    value: string
    description?: string
    trend?: 'up' | 'down' | 'neutral'
    className?: string
}) {
    return (
        <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center space-y-2 border-glow-emerald">
            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">{title}</span>
            <span className="text-2xl font-black text-neon-emerald tracking-tighter">{value}</span>
        </div>
    )
}
