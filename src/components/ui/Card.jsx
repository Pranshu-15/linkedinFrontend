import React from "react";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

const Card = React.forwardRef(({ className, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    whileHover={{ y: -2 }}
    transition={{ duration: 0.2 }}
    className={cn("rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden", className)}
    {...props}
  >
    {children}
  </motion.div>
));
Card.displayName = "Card";

export { Card };
