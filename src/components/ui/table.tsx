import * as React from "react"
import { useState, useRef, useLayoutEffect, useEffect } from "react"

import { cn } from "@/lib/utils"

// --- Original components (Table, TableHeader, etc.) are unchanged ---

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"


// --- "SMART" TABLE CELL (CORRECTED) ---

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  variant?: "phone";
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, variant, ...props }, ref) => {
    // 1. ALL HOOKS ARE CALLED AT THE TOP LEVEL, UNCONDITIONALLY.
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    
    const cellRef = useRef<HTMLTableCellElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // This hook connects the passed-in `ref` to our internal `cellRef`.
    React.useImperativeHandle(ref, () => cellRef.current!, []);
    
    // 2. LOGIC IS MOVED INSIDE THE HOOKS OR JSX.
    
    // Effect to check for content overflow. It runs on every render but
    // has an internal check to do nothing for the "phone" variant.
    useLayoutEffect(() => {
      if (variant === 'phone') {
        setIsOverflowing(false); // Reset state if variant changes
        return; // Exit early, but the hook itself was still called.
      }
      
      const checkOverflow = () => {
        const contentElement = contentRef.current;
        if (contentElement) {
          const hasOverflow = contentElement.scrollWidth > contentElement.clientWidth;
          setIsOverflowing(hasOverflow);
        }
      };

      checkOverflow();
      window.addEventListener("resize", checkOverflow);
      return () => window.removeEventListener("resize", checkOverflow);
    }, [children, variant]); // Depend on variant to re-check if it changes.

    // Effect to close the pop-up when clicking outside.
    useEffect(() => {
        if (!isPopupOpen) return; // Internal conditional is fine.

        const handleClickOutside = (event: MouseEvent) => {
            if (cellRef.current && !cellRef.current.contains(event.target as Node)) {
                setPopupOpen(false);
            }
        };
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isPopupOpen]);


    // Handlers
    const handleClick = () => {
      if (isOverflowing) {
        setPopupOpen(p => !p);
      }
    };
    
    const fullText = typeof children === 'string' ? children : undefined;

    // 3. CONDITIONAL RENDERING is done in the return statement.
    if (variant === "phone") {
      return (
        <td ref={cellRef} className={cn("p-2 align-middle text-center", className)} {...props}>
          <div className="[writing-mode:vertical-rl] [text-orientation:mixed] rotate-180 whitespace-nowrap">
            {children}
          </div>
        </td>
      );
    }
    
    // Default "smart" cell rendering for all other cases
    return (
      <td
        ref={cellRef}
        className={cn(
          "relative p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
          className
        )}
        {...props}
      >
        <div
          ref={contentRef}
          onClick={handleClick}
          className={cn({ "truncate cursor-pointer": isOverflowing })}
          title={isOverflowing ? fullText : undefined}
        >
          {children}
        </div>
        
        {isOverflowing && isPopupOpen && (
          <div className="absolute left-0 top-0 z-10 w-fit max-w-sm rounded-md border bg-popover p-2 text-popover-foreground shadow-lg">
            {children}
          </div>
        )}
      </td>
    );
  }
);
TableCell.displayName = "TableCell";


// --- EXPORT EVERYTHING ---
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} 