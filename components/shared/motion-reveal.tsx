"use client"

import * as React from "react"
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utils"

type MotionRevealProps = HTMLMotionProps<"div"> & {
  delay?: number
  y?: number
  duration?: number
  once?: boolean
}

export default function MotionReveal({
  children,
  className,
  delay = 0,
  y = 14,
  duration = 0.45,
  once = true,
  ...props
}: MotionRevealProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
