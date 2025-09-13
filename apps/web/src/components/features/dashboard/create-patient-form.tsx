"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PlusIcon, CalendarIcon } from "lucide-react";
import { Patient } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { usePatients } from "@/hooks/use-patients";

const buildCreatePatientSchema = (patients: Patient[] = []) =>
  z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address")
      .refine(
        (value) => {
          if (!value || patients.length === 0) return true;
          return !patients.some(
            (p) => p.email.toLowerCase() === value.toLowerCase()
          );
        },
        {
          message: "Email already exists",
        }
      ),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .refine(
        (value) => {
          // Only allow digits and optional + at the start
          if (!/^\+?[\d\s\-\(\)]+$/.test(value)) {
            return false;
          }

          const normalized = value.replace(/[^\d+]/g, "");
          const digits = normalized.startsWith("+")
            ? normalized.slice(1)
            : normalized;

          // Must be exactly 8-15 digits, starting with 1-9
          return /^[1-9]\d{7,14}$/.test(digits);
        },
        {
          message:
            "Please enter a valid phone number (8–15 digits, optional +).",
        }
      ),
    dob: z
      .string()
      .min(1, "Date of birth is required")
      .refine((val) => !Number.isNaN(Date.parse(val)), {
        message: "Date of birth must be a valid date",
      }),
    additionalInformation: z.string().optional(),
  });

type CreatePatientFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  additionalInformation?: string;
};

interface CreatePatientFormProps {
  onClose: () => void;
  onSubmit: (patient: Omit<Patient, "id" | "createdAt" | "updatedAt">) => void;
}

export function CreatePatientForm({
  onClose,
  onSubmit,
}: CreatePatientFormProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { data: patients = [] } = usePatients();

  const schema = useMemo(() => {
    return buildCreatePatientSchema(patients);
  }, [patients]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CreatePatientFormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      dob: "",
      additionalInformation: "",
    },
  });

  const dobValue = watch("dob");

  const onFormSubmit = (data: CreatePatientFormData) => {
    const payload = {
      ...data,
      dob: data.dob,
    };
    onSubmit(payload);
    reset();
    onClose();
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = date.toISOString();
      setValue("dob", formattedDate);
      setIsCalendarOpen(false);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            {...register("firstName")}
            placeholder="Enter first name"
            className={errors.firstName ? "border-error" : ""}
          />
          {errors.firstName && (
            <p className="text-sm text-error">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            {...register("lastName")}
            placeholder="Enter last name"
            className={errors.lastName ? "border-error" : ""}
          />
          {errors.lastName && (
            <p className="text-sm text-error">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="Enter email address"
          className={errors.email ? "border-error" : ""}
        />
        {errors.email && (
          <p className="text-sm text-error">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number *</Label>
        <Input
          id="phoneNumber"
          type="tel"
          inputMode="tel"
          {...register("phoneNumber")}
          placeholder="Enter phone number"
          className={errors.phoneNumber ? "border-error" : ""}
        />
        {errors.phoneNumber && (
          <p className="text-sm text-error">{errors.phoneNumber.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dob">Date of Birth *</Label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dobValue && "text-muted-foreground",
                errors.dob && "border-error"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dobValue ? (
                formatDateForDisplay(dobValue)
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dobValue ? new Date(dobValue) : undefined}
              onSelect={handleDateSelect}
              disabled={(date) => date > new Date()}
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>
        {errors.dob && (
          <p className="text-sm text-error">{errors.dob.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalInformation">Additional Information</Label>
        <Textarea
          id="additionalInformation"
          {...register("additionalInformation")}
          placeholder="Enter any additional information about the patient"
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary text-primary-foreground"
          disabled={isSubmitting}
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          {isSubmitting ? "Creating..." : "Create Patient"}
        </Button>
      </div>
    </form>
  );
}
