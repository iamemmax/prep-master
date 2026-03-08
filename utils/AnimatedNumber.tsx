// components/AnimatedNumber.tsx
import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  className?: string;
  
}

export default function AnimatedNumber({ value, prefix = "₦", className }: AnimatedNumberProps) {
  const spring = useSpring(value, { stiffness: 100, damping: 20 });
  const transformed = useTransform(spring, (latest) =>
    Math.floor(latest).toLocaleString()
  );

  const [display, setDisplay] = useState<string>("0");

  useEffect(() => {
    const unsubscribe = transformed.on("change", (v) => {
      setDisplay(v);
    });
    spring.set(value); // animate to new value
    return () => unsubscribe();
  }, [value]);

  return (
    <motion.span className={className}>
      {prefix}
      {display}
    </motion.span>
  );
}
