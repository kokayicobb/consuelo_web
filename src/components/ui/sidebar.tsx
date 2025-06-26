"use client"

import { cn } from "@/lib/utils"
import Link, { type LinkProps } from "next/link"
import React, { useState, createContext, useContext } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react"

interface Links {
  label: string
  href: string
  icon: React.JSX.Element | React.ReactNode
  onClick?: () => void
}

interface SidebarContextProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  animate: boolean
  isMobile: boolean
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode
  open?: boolean
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  animate?: boolean
}) => {
  const [openState, setOpenState] = useState(true) // Default to open
  const [isMobile, setIsMobile] = useState(false)

  React.useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const open = openProp !== undefined ? openProp : openState
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState

  return <SidebarContext.Provider value={{ open, setOpen, animate, isMobile }}>{children}</SidebarContext.Provider>
}

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate = true,
}: {
  children: React.ReactNode
  open?: boolean
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  animate?: boolean
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  )
}

export const SidebarBody = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode
  className?: string
  [key: string]: any
}) => {
  return (
    <>
      <DesktopSidebar className={className} {...props}>
        {children}
      </DesktopSidebar>
      <MobileSidebar className={className}>{children}</MobileSidebar>
    </>
  )
}

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: {
  className?: string
  children: React.ReactNode
  [key: string]: any
}) => {
  const { open, setOpen, animate } = useSidebar()

  return (
    <>
      {/* Main Sidebar */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "16rem", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={cn(
              "h-full hidden md:flex md:flex-col bg-neutral-50 border-r border-gray-200 flex-shrink-0 relative group overflow-hidden",
              className,
            )}
            {...props}
          >
            <div className="w-64 h-full">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Tab Button - Only show when sidebar is closed */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed left-0 top-4 z-50 hidden md:block"
          >
            <button
              onClick={() => setOpen(true)}
              className="h-8 w-6 bg-neutral-50 border border-gray-200 shadow-sm hover:bg-gray-50 rounded-r-md rounded-l-none flex items-center justify-center transition-colors duration-150"
            >
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export const MobileSidebar = ({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) => {
  const { open, setOpen } = useSidebar()
  return (
    <>
      <div className={cn("h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-neutral-50 w-full")}>
        <div className="flex justify-end z-20 w-full">
          <Menu className="text-gray-700 opacity-50 cursor-pointer" onClick={() => setOpen(!open)} />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-screen w-full inset-0 bg-neutral-50 p-4 z-[100] flex flex-col justify-between",
                className,
              )}
            >
              <div className="absolute right-4 top-4 z-50 text-gray-600 cursor-pointer" onClick={() => setOpen(false)}>
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

// src/components/ui/sidebar.tsx

export const SidebarLink = ({
  link,
  className,
  onClick,
  isActive, // ADD THIS PROP
  ...props
}: {
  link: Links
  className?: string
  onClick?: () => void
  isActive?: boolean // ADD THIS PROP
  props?: LinkProps
}) => {
  const { isMobile, setOpen } = useSidebar()

  const handleClick = (e: React.MouseEvent) => {
    // ... (your existing click handler logic)
    if (onClick) onClick();
    if (link?.onClick) link.onClick();
    if (isMobile) setOpen(false);
  }

  if (!link) {
    console.error("SidebarLink: link prop is undefined")
    return null
  }

  return (
    <Link
      href={link.href || ""}
      className={cn(
        "flex items-center rounded-md px-2 py-1.5 text-sm justify-start",
        "transition-all duration-300 ease-out", 
        // THIS IS THE CORE LOGIC CHANGE:
        {
          "bg-neutral-200 text-neutral-900 font-medium": isActive, // Active state
          "text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 hover:font-medium": !isActive, // Default and Hover state
        },
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {link.icon && <span className="mr-2">{link.icon}</span>}
      <span className="whitespace-pre inline-block">{link.label || "Link"}</span>
    </Link>
  )
}

// Export a collapse button component for use in the sidebar header
export const SidebarCollapseButton = ({ className }: { className?: string }) => {
  const { setOpen } = useSidebar()

  return (
    <button
      onClick={() => setOpen(false)}
      className={cn(
        "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded flex items-center justify-center",
        className,
      )}
    >
      <ChevronLeft size={18} />
    </button>
  )
}
