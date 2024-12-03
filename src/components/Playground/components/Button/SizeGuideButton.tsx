"use client";

import * as React from "react";
import { Ruler } from "lucide-react";
import { useMediaQuery } from "../../hooks/UseMediaQuery";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { SizeGuideForm } from "../Form/SizeGuideForm";
import { Button } from "../ui/button";
import { DialogHeader } from "../ui/dialog";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";



export function SizeGuideButton() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="link" className="h-auto p-0">
            <span className="text-sm">
              Fit Calculator <span className="underline">Get exact size</span>
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
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
            Fit Calculator <span className="underline">Get exact size</span>
          </span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
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
		Our Fit Calculator uses advanced algorithms to predict your perfect size
		based on your measurements and preferences.
	      </p>
	      <Button className="w-full" onClick={() => setStarted(true)}>
		Start Size Calculation
	      </Button>
	    </div>
	  );
	}
      
	return <SizeGuideForm />;
      }