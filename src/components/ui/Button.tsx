import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold",
                destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90",
                outline: "border-2 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10",
                secondary: "glass-panel text-white hover:bg-white/10 border-white/20",
                ghost: "text-zinc-400 hover:text-white",
                link: "text-emerald-400 underline-offset-4 hover:underline",
                neon: "bg-neon-gradient text-zinc-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all",
                primary: "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] border-none font-black",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-8 px-3 text-[10px] tracking-wider uppercase font-bold",
                lg: "h-12 rounded-md px-8 text-lg font-bold",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        // Note: in a real app would use cn() utility for class merging, skipping here for simplicity
        return (
            <Comp
                className={buttonVariants({ variant, size, className })}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
