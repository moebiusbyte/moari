var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "@/lib/utils";
var Alert = React.forwardRef(function Alert(_a, ref) {
    var className = _a.className, _b = _a.variant, variant = _b === void 0 ? 'default' : _b, props = __rest(_a, ["className", "variant"]);
    var baseStyles = "relative w-full rounded-lg border p-4";
    var variantStyles = {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive"
    };
    return (_jsx("div", __assign({ ref: ref, role: "alert", className: cn(baseStyles, variantStyles[variant], className) }, props)));
});
var AlertTitle = React.forwardRef(function AlertTitle(_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (_jsx("h5", __assign({ ref: ref, className: cn("mb-1 font-medium leading-none tracking-tight", className) }, props)));
});
var AlertDescription = React.forwardRef(function AlertDescription(_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (_jsx("div", __assign({ ref: ref, className: cn("text-sm [&_p]:leading-relaxed", className) }, props)));
});
export { Alert, AlertTitle, AlertDescription };
