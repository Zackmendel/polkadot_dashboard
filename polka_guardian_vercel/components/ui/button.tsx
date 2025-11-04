import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#FF2670] to-[#E6007A] text-white hover:from-[#FF3D82] hover:to-[#F0108C] hover:shadow-[0_6px_20px_rgba(230,0,122,0.5)] hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(230,0,122,0.3)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-polkadot-pink-600 bg-transparent text-polkadot-pink-500 hover:bg-polkadot-pink-600/10 hover:border-polkadot-pink-500",
        secondary: "bg-polkadot-pink-600/10 text-polkadot-pink-500 border border-polkadot-pink-600/30 hover:bg-polkadot-pink-600/20",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-polkadot-pink-500 underline-offset-4 hover:underline hover:text-polkadot-pink-400",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
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
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
