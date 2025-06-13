import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "@/lib/utils";
const Alert = React.forwardRef(function Alert({ className, variant = 'default', ...props }, ref) {
    const baseStyles = "relative w-full rounded-lg border p-4";
    const variantStyles = {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive"
    };
    return (_jsx("div", { ref: ref, role: "alert", className: cn(baseStyles, variantStyles[variant], className), ...props }));
});
const AlertTitle = React.forwardRef(function AlertTitle({ className, ...props }, ref) {
    return (_jsx("h5", { ref: ref, className: cn("mb-1 font-medium leading-none tracking-tight", className), ...props }));
});
const AlertDescription = React.forwardRef(function AlertDescription({ className, ...props }, ref) {
    return (_jsx("div", { ref: ref, className: cn("text-sm [&_p]:leading-relaxed", className), ...props }));
});
export { Alert, AlertTitle, AlertDescription };
