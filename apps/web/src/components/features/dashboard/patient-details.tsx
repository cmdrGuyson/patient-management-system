"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Patient } from "@/types";
import { Edit2, Save, X, Trash2, CalendarIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Can } from "../common/can";
import { PERMISSIONS } from "@/lib/auth";
import { usePatients, useUpdatePatient } from "@/hooks/use-patients";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

const buildEditPatientSchema = (patients: Patient[] = [], currentId?: number) =>
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
          const lower = value.toLowerCase();
          return !patients.some(
            (p) => p.id !== currentId && p.email.toLowerCase() === lower
          );
        },
        { message: "Email already exists" }
      ),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .refine(
        (value) => {
          if (!/^\+?[\d\s\-\(\)]+$/.test(value)) return false;
          const normalized = value.replace(/[^\d+]/g, "");
          const digits = normalized.startsWith("+")
            ? normalized.slice(1)
            : normalized;
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

type EditPatientFormData = z.infer<ReturnType<typeof buildEditPatientSchema>>;

interface PatientDetailsProps {
  patient: Patient;
}

export default function PatientDetails({ patient }: PatientDetailsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { data: patients = [] } = usePatients();
  const updatePatient = useUpdatePatient();
  const { hasPermission } = useAuth();

  const schema = useMemo(
    () => buildEditPatientSchema(patients, patient.id),
    [patients, patient.id]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<EditPatientFormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      dob: patient.dob,
      additionalInformation: patient.additionalInformation || "",
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.PATIENT_UPDATE)) {
      return;
    }
    const editMode = searchParams.get("edit");
    if (editMode === "true") {
      setIsEditing(true);
    }
  }, [searchParams, hasPermission]);

  const handleEdit = () => {
    setIsEditing(true);
    reset({
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      dob: patient.dob,
      additionalInformation: patient.additionalInformation || "",
    });
    // Update URL to include edit mode
    const url = new URL(window.location.href);
    url.searchParams.set("edit", "true");
    router.replace(url.pathname + url.search);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset({
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      dob: patient.dob,
      additionalInformation: patient.additionalInformation || "",
    });
    // Remove edit mode from URL
    const url = new URL(window.location.href);
    url.searchParams.delete("edit");
    router.replace(url.pathname + url.search);
  };

  const onFormSubmit = (data: EditPatientFormData) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      dob: data.dob,
      additionalInformation: data.additionalInformation || undefined,
    };

    updatePatient.mutate(
      { id: patient.id, updates: payload },
      {
        onSuccess: () => {
          toast.success("Patient updated successfully");
          setIsEditing(false);

          const url = new URL(window.location.href);
          url.searchParams.delete("edit");
          router.replace(url.pathname + url.search);
        },
        onError: (error) => {
          console.error("Failed to update patient", error);
          toast.error("Failed to update patient");
        },
      }
    );
  };

  const handleDelete = () => {
    // TODO: Implement this
    console.log("Deleting patient:", patient.id);
    router.push("/patients");
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = date.toISOString();
      setValue("dob", formattedDate);
      setIsCalendarOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateForDisplay = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  const currentData = isEditing ? watchedValues : patient;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 transition-all duration-300 min-w-0 overflow-hidden">
      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-3xl font-bold tracking-tight truncate">
              {patient.firstName} {patient.lastName}
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-300 ${
                isEditing
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 opacity-100 scale-100"
                  : "opacity-0 scale-95"
              }`}
            >
              Editing
            </span>
          </div>
          <p className="text-muted-foreground">Patient Details</p>
        </div>
        <div className="flex gap-2 transition-all duration-300 flex-shrink-0">
          {!isEditing ? (
            <>
              <Can perform={PERMISSIONS.PATIENT_UPDATE}>
                <div className="transition-all duration-300 opacity-100 translate-x-0">
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Information
                  </Button>
                </div>
              </Can>
              <Can perform={PERMISSIONS.PATIENT_DELETE}>
                <div className="transition-all duration-300 opacity-100 translate-x-0">
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </Can>
            </>
          ) : (
            <>
              <div className="transition-all duration-300 opacity-100 translate-x-0">
                <Button
                  onClick={handleSubmit(onFormSubmit)}
                  size="sm"
                  disabled={isSubmitting || updatePatient.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting || updatePatient.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </div>
              <div className="transition-all duration-300 opacity-100 translate-x-0">
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Patient Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        {/* Basic Information */}
        <Card className="transition-all duration-300">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-semibold">
                  First Name
                </Label>
                <div className="transition-all duration-300">
                  {isEditing ? (
                    <div className="space-y-1">
                      <Input
                        id="firstName"
                        {...register("firstName")}
                        className={cn(
                          "animate-in fade-in-0 slide-in-from-top-1 duration-300",
                          errors.firstName && "border-error"
                        )}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-error">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                      {currentData.firstName}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-semibold">
                  Last Name
                </Label>
                <div className="transition-all duration-300">
                  {isEditing ? (
                    <div className="space-y-1">
                      <Input
                        id="lastName"
                        {...register("lastName")}
                        className={cn(
                          "animate-in fade-in-0 slide-in-from-top-1 duration-300",
                          errors.lastName && "border-error"
                        )}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-error">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                      {currentData.lastName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email
              </Label>
              <div className="transition-all duration-300">
                {isEditing ? (
                  <div className="space-y-1">
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      className={cn(
                        "animate-in fade-in-0 slide-in-from-top-1 duration-300",
                        errors.email && "border-error"
                      )}
                    />
                    {errors.email && (
                      <p className="text-sm text-error">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                    {currentData.email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-semibold">
                Phone Number
              </Label>
              <div className="transition-all duration-300">
                {isEditing ? (
                  <div className="space-y-1">
                    <Input
                      id="phoneNumber"
                      {...register("phoneNumber")}
                      className={cn(
                        "animate-in fade-in-0 slide-in-from-top-1 duration-300",
                        errors.phoneNumber && "border-error"
                      )}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-error">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                    {currentData.phoneNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob" className="text-sm font-semibold">
                Date of Birth
              </Label>
              <div className="transition-all duration-300">
                {isEditing ? (
                  <div className="space-y-1">
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal animate-in fade-in-0 slide-in-from-top-1 duration-300",
                            !currentData.dob && "text-muted-foreground",
                            errors.dob && "border-error"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {currentData.dob ? (
                            formatDateForDisplay(currentData.dob)
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            currentData.dob
                              ? new Date(currentData.dob)
                              : undefined
                          }
                          onSelect={handleDateSelect}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.dob && (
                      <p className="text-sm text-error">{errors.dob.message}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                    {formatDateForDisplay(currentData.dob)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="transition-all duration-300">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="additionalInformation"
                className="text-sm font-semibold"
              >
                Medical Notes
              </Label>
              <div className="transition-all duration-300">
                {isEditing ? (
                  <Textarea
                    id="additionalInformation"
                    {...register("additionalInformation")}
                    rows={6}
                    className="resize-none animate-in fade-in-0 slide-in-from-top-1 duration-300"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                    {currentData.additionalInformation ||
                      "No additional information available"}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="lg:col-span-2 transition-all duration-300">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Patient ID</Label>
                <p className="text-sm text-muted-foreground">{patient.id}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Created At</Label>
                <p className="text-sm text-muted-foreground">
                  {formatDate(patient.createdAt)}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Last Updated</Label>
                <p className="text-sm text-muted-foreground">
                  {formatDate(patient.updatedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
