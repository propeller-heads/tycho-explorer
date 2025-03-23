
"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"

import { cn } from "@/lib/utils"
import { Toggle } from "@radix-ui/react-toggle"

const ToggleGroupContext = React.createContext<{
  size?: "default" | "sm" | "lg"
}>({
  size: "default",
})

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & {
    size?: "default" | "sm" | "lg"
  }
>(({ className, size = "default", children, ...props }, ref) => (
  <ToggleGroupContext.Provider value={{ size }}>
    <ToggleGroupPrimitive.Root
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-1",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Root>
  </ToggleGroupContext.Provider>
))

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & {
    size?: "default" | "sm" | "lg"
  }
>(({ className, children, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)
  const itemSize = size ?? context.size

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
        itemSize === "sm" && "h-8 px-2.5",
        itemSize === "default" && "h-9 px-3",
        itemSize === "lg" && "h-10 px-4",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
