
import * as React from "react"
import { useTheme } from "@/contexts/ThemeContext"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border shadow-sm",
        isLight ? "bg-white border-gray-200 text-gray-800" : "bg-card text-card-foreground border-cyber-purple/20",
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  return (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        isLight ? "text-gray-900" : "",
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  return (
    <p
      ref={ref}
      className={cn(
        isLight ? "text-gray-600" : "text-muted-foreground", 
        "text-sm", 
        className
      )}
      {...props}
    />
  )
})
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center p-6 pt-0",
        isLight ? "border-t border-gray-200" : "",
        className
      )}
      {...props}
    />
  )
})
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
