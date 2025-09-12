"use client";

import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CreatePatientForm } from "./create-patient-form";
import { PlusIcon } from "lucide-react";
import { Patient } from "@/types";

interface CreatePatientModalProps {}

export function CreatePatientModal({}: CreatePatientModalProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const handlePatientCreate = (
    patient: Omit<Patient, "id" | "createdAt" | "updatedAt">
  ) => {
    // TODO: Create patient - integrate with API
    console.log("Creating patient:", patient);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const triggerButton = (
    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
      <PlusIcon className="w-4 h-4 mr-2" />
      Create Patient
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0 px-4 pt-4">
            <DrawerTitle>Create New Patient</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
            <CreatePatientForm
              onClose={handleClose}
              onSubmit={handlePatientCreate}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Patient</DialogTitle>
        </DialogHeader>
        <CreatePatientForm
          onClose={handleClose}
          onSubmit={handlePatientCreate}
        />
      </DialogContent>
    </Dialog>
  );
}
