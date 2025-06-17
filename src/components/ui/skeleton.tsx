import type React from "react"
import { cn } from "@/lib/utils"

// Clean, Notion-inspired skeleton with professional aesthetics
function Skeleton({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "text" | "avatar" | "card"
}) {
  const variants = {
    default: "h-4 bg-slate-100",
    text: "h-4 bg-slate-100 rounded-sm",
    avatar: "h-10 w-10 bg-slate-100 rounded-full",
    card: "h-32 bg-slate-100 rounded-lg",
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        "before:animate-[shimmer_2s_infinite]",
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}

// Skeleton variants for common use cases
const SkeletonText = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <Skeleton variant="text" className={cn("w-full", className)} {...props} />
)

const SkeletonAvatar = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <Skeleton variant="avatar" className={className} {...props} />
)

const SkeletonCard = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <Skeleton variant="card" className={className} {...props} />
)

// Skeleton patterns for common layouts
const SkeletonPost = () => (
  <div className="space-y-4 p-6">
    <div className="flex items-center space-x-3">
      <SkeletonAvatar />
      <div className="space-y-2 flex-1">
        <SkeletonText className="w-32 h-3" />
        <SkeletonText className="w-24 h-3" />
      </div>
    </div>
    <div className="space-y-3">
      <SkeletonText className="w-full h-4" />
      <SkeletonText className="w-4/5 h-4" />
      <SkeletonText className="w-3/5 h-4" />
    </div>
  </div>
)

const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <SkeletonText className="w-8 h-8 rounded" />
        <SkeletonText className="flex-1 h-4" />
        <SkeletonText className="w-20 h-4" />
        <SkeletonText className="w-16 h-4" />
      </div>
    ))}
  </div>
)

export { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard, SkeletonPost, SkeletonTable }
