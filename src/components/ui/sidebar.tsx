"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Lock, Unlock } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
  onClick?: () => void;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
  isMobile: boolean;
  locked: boolean;
  setLocked: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [locked, setLocked] = useState(false);
  
  React.useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate, isMobile, locked, setLocked }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <>
      <DesktopSidebar className={className} {...props}>
        {children}
      </DesktopSidebar>
      <MobileSidebar className={className}>
        {children}
      </MobileSidebar>
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) => {
  const { open, setOpen, animate, locked, setLocked } = useSidebar();
  
  const handleMouseEnter = () => {
    if (!locked) {
      setOpen(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (!locked) {
      setOpen(false);
    }
  };

  return (
    <motion.div
    className={cn(
      "h-full px-4 py-4 hidden md:flex md:flex-col bg-gray-100 border-r border-gray-200 w-64 flex-shrink-0 relative",
      className
      )}
      animate={{
        width: animate ? (open ? "16rem" : "4rem") : "16rem",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
      
      {/* Lock Button */}
      <div className="mt-auto pt-4 flex justify-center">
        <button
          onClick={() => {
            setLocked(!locked);
            if (!locked) {
              // When locking, ensure sidebar is open
              setOpen(true);
            }
          }}
          className="p-2 rounded-md hover:bg-gray-200 text-gray-600 transition-colors"
          title={locked ? "Unlock sidebar" : "Lock sidebar open"}
        >
          {locked ? <Unlock size={20} /> : <Lock size={20} />}
        </button>
      </div>
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
       className={cn(
        "h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-gray-50 w-full"
      )}
      >
        <div className="flex justify-end z-20 w-full">
          <Menu
           className="text-gray-700 opacity-50 cursor-pointer"
            onClick={() => setOpen(!open)}
          />
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
                "fixed h-screen w-full inset-0 bg-gray-100 p-4 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <div
                className="absolute right-4 top-4 z-50 text-gray-100 cursor-pointer"
                onClick={() => setOpen(false)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  onClick,
  ...props
}: {
  link: Links;
  className?: string;
  onClick?: () => void;
  props?: LinkProps;
}) => {
  const { open, setOpen, animate, isMobile } = useSidebar();
  
  const handleClick = (e: React.MouseEvent) => {
    // Handle custom click events
    if (onClick) {
      onClick();
    }
    
    if (link?.onClick) {
      link.onClick();
    }
    
    // Close mobile sidebar after clicking a link
    if (isMobile) {
      setOpen(false);
    }
  };
  
  // Add a safety check to ensure link exists
  if (!link) {
    console.error("SidebarLink: link prop is undefined");
    return null;
  }
  
  return (
    <Link
      href={link.href || ""} 
      className={cn(
        "flex items-center rounded-lg px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-800 transition-colors",
        open ? "justify-start" : "justify-center",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {link.icon && <span className={open ? "mr-3" : "mr-0"}>{link.icon}</span>}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="whitespace-pre inline-block"
      >
        {link.label || "Link"}
      </motion.span>
    </Link>
  );
};