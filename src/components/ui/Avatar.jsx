import React from "react";
import { cn } from "../../lib/utils";
import dp from "../../assets/dp.webp";

const Avatar = React.forwardRef(({ className, src, alt, size = "md", ...props }, ref) => {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
    xl: "h-20 w-20",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border bg-secondary",
        sizes[size],
        className
      )}
      {...props}
    >
      <img
        src={src || dp}
        alt={alt || "Avatar"}
        className="aspect-square h-full w-full object-cover"
        onError={(e) => {
          e.target.src = dp;
        }}
      />
    </div>
  );
});
Avatar.displayName = "Avatar";

export { Avatar };
