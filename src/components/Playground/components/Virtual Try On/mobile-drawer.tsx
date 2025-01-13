import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer } from "vaul";

const MobileDrawer = ({ open, onOpenChange, children }) => {
  const scrollPos = useRef(0);

  useEffect(() => {
    if (open) {
      // Save current scroll position
      scrollPos.current = window.scrollY;

      // Lock body scroll
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPos.current}px`;
      document.body.style.width = "100%";
    } else {
      // Restore body scroll
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollPos.current);
    }

    return () => {
      // Cleanup on unmount
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [open]);

  const handleOpen = () => {
    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Open the drawer
    onOpenChange(true);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const stopPropagation = (event) => {
    // Prevent clicks inside the drawer from propagating
    event.stopPropagation();
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      {/* Trigger Button */}
      <Drawer.Trigger asChild>
        <Button
          variant="link"
          className="w-auto h-auto justify-start p-0"
          onClick={handleOpen} // Handle scroll-to-top and open logic
        >
          <span className="whitespace-normal text-sm">
            Try-On Studio <span className="underline">Powered by AI</span>
          </span>
        </Button>
      </Drawer.Trigger>

      {/* Drawer Portal */}
      <Drawer.Portal>
        {/* Overlay */}
        <Drawer.Overlay
          className="fixed inset-0 bg-black/25 z-40"
          onClick={handleClose} // Close drawer when clicking on overlay
        />

        {/* Drawer Content */}
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 max-h-[96%] rounded-t-[10px] bg-white z-50 overflow-y-auto overscroll-contain"
          onClick={stopPropagation} // Prevent clicks inside drawer from propagating
        >
          <div className="relative p-4">
            {/* Close Button */}
            <Drawer.Close
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100"
              onClick={handleClose}
            >
              <X className="h-5 w-5 text-gray-500" />
            </Drawer.Close>
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default MobileDrawer;
