"use client";

import * as React from "react";
import { Ruler } from "lucide-react";
import { useMediaQuery } from "../../hooks/UseMediaQuery";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { SizeGuideForm } from "../Form/SizeGuideForm";
import { Button } from "../ui/button";
import { DialogHeader } from "../ui/dialog";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

export function SizeGuideButton() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 1000px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="link" className="h-auto max-w-[300px] sm:max-w-[500px] p-0">
          <span className="text-sm whitespace-normal">
              Fit Calculator <span className="underline">Get exact size</span>{" "}
              
              <span  className="whitespace-normal text-sm italic text-muted-foreground bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text [-webkit-background-clip:text] text-transparent no-underline hover:no-underline">
                Powered by AI
              </span>
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Fit Calculator predicts your size</DialogTitle>
          </DialogHeader>
          <SizeGuideContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
    <DrawerTrigger asChild>
      <Button variant="link" className="h-auto p-0">
        <span className="text-sm">
          Fit Calculator <span className="underline">Get exact size</span>{" "}
          
          <span className="whitespace-normal italic text-xs text-muted-foreground bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text [-webkit-background-clip:text] text-transparent no-underline hover:no-underline">
            Powered by AI
          </span>
        </span>
      </Button>
    </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Fit Calculator predicts your size</DrawerTitle>
        </DrawerHeader>
        <SizeGuideContent />
      </DrawerContent>
    </Drawer>
  );
}

function SizeGuideContent() {
  const [started, setStarted] = React.useState(false);

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-4">
        <Ruler className="h-12 w-12 text-primary" />
        <p className="text-center text-sm text-muted-foreground">
          Our Fit Calculator uses advanced AI algorithms to predict your perfect
          size based on your measurements and preferences.
        </p>
        <Button className="w-full" onClick={() => setStarted(true)}>
          Start Fit Calculation
        </Button>
      </div>
    );
  }

  return <SizeGuideForm />;
}
