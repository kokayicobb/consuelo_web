import React, { useEffect, useRef } from 'react';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer } from 'vaul';

const MobileDrawer = ({ open, onOpenChange, children }) => {
  const contentRef = useRef(null);
  const scrollPos = useRef(0);

  useEffect(() => {
    if (open) {
      // Store current scroll position when opening
      scrollPos.current = window.scrollY;
      
      // Prevent body scroll while maintaining position
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPos.current}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position when closing
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollPos.current);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [open]);

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      // Add a small delay to ensure smooth closing animation
      setTimeout(() => {
        window.scrollTo(0, scrollPos.current);
      }, 10);
    }
    onOpenChange(newOpen);
  };

  return (
    <Drawer.Root open={open} onOpenChange={handleOpenChange}>
      <Drawer.Trigger asChild>
        <Button variant="link" className="w-auto h-auto justify-start p-0">
          <span className="whitespace-normal text-sm">
            Try-On Studio <span className="underline">Powered by AI</span>{" "}
            {/* <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text px-[2px] text-sm italic text-transparent hover:no-underline">
              Powered by AI
            </span> */}
          </span>
        </Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/25" />
        <Drawer.Content 
          ref={contentRef}
          className="fixed bottom-0 left-0 right-0 max-h-[96%] rounded-t-[10px] bg-white z-50 overflow-y-auto overscroll-contain"
        >
          <div className="relative p-4">
            <Drawer.Close className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100">
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