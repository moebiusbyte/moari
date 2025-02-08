import * as React from "react"
import { cn } from "@/lib/utils"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  function Alert({ className, variant = 'default', ...props }, ref) {
    const baseStyles = "relative w-full rounded-lg border p-4"
    const variantStyles = {
      default: "bg-background text-foreground",
      destructive: "border-destructive/50 text-destructive dark:border-destructive"
    }
    
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      />
    )
  }
)

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function AlertTitle({ className, ...props }, ref) {
    return (
      <h5
        ref={ref}
        className={cn("mb-1 font-medium leading-none tracking-tight", className)}
        {...props}
      />
    )
  }
)

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function AlertDescription({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("text-sm [&_p]:leading-relaxed", className)}
        {...props}
      />
    )
  }
)

export { Alert, AlertTitle, AlertDescription }