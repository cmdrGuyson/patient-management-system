"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Patient } from "@/types";
import { Edit2, Save, X, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";

interface PatientDetailsProps {
  patient: Patient;
}

export default function PatientDetails({ patient }: PatientDetailsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);

  const [editedPatient, setEditedPatient] = useState<Patient | undefined>(
    patient
  );

  // Check for edit mode query parameter on component mount
  useEffect(() => {
    const editMode = searchParams.get("edit");
    if (editMode === "true") {
      setIsEditing(true);
      setEditedPatient(patient);
    }
  }, [searchParams, patient]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedPatient(patient);
    // Update URL to include edit mode
    const url = new URL(window.location.href);
    url.searchParams.set("edit", "true");
    router.replace(url.pathname + url.search);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedPatient(patient);
    // Remove edit mode from URL
    const url = new URL(window.location.href);
    url.searchParams.delete("edit");
    router.replace(url.pathname + url.search);
  };

  const handleSave = () => {
    if (editedPatient) {
      // TODO: Implement this
      console.log("Saving patient:", editedPatient);
      setIsEditing(false);

      // Remove edit mode from URL
      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      router.replace(url.pathname + url.search);
    }
  };

  const handleDelete = () => {
    // TODO: Implement this
    console.log("Deleting patient:", patient.id);
    router.push("/patients");
  };

  const handleInputChange = (field: keyof Patient, value: string) => {
    setEditedPatient((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const currentData = isEditing && editedPatient ? editedPatient : patient;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 transition-all duration-300">
      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
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
        <div className="flex gap-2 transition-all duration-300">
          {!isEditing ? (
            <>
              <div className="transition-all duration-300 opacity-100 translate-x-0">
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Information
                </Button>
              </div>
              <div className="transition-all duration-300 opacity-100 translate-x-0">
                <Button onClick={handleDelete} variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="transition-all duration-300 opacity-100 translate-x-0">
                <Button onClick={handleSave} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <Input
                      id="firstName"
                      value={currentData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className="animate-in fade-in-0 slide-in-from-top-1 duration-300"
                    />
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
                    <Input
                      id="lastName"
                      value={currentData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className="animate-in fade-in-0 slide-in-from-top-1 duration-300"
                    />
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
                  <Input
                    id="email"
                    type="email"
                    value={currentData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="animate-in fade-in-0 slide-in-from-top-1 duration-300"
                  />
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
                  <Input
                    id="phoneNumber"
                    value={currentData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    className="animate-in fade-in-0 slide-in-from-top-1 duration-300"
                  />
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
                  <Input
                    id="dob"
                    type="date"
                    value={currentData.dob}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                    className="animate-in fade-in-0 slide-in-from-top-1 duration-300"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                    {formatDate(currentData.dob)}
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
                    value={currentData.additionalInformation || ""}
                    onChange={(e) =>
                      handleInputChange("additionalInformation", e.target.value)
                    }
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
                <p className="text-sm text-muted-foreground">
                  {currentData.id}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Created At</Label>
                <p className="text-sm text-muted-foreground">
                  {formatDate(currentData.createdAt)}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Last Updated</Label>
                <p className="text-sm text-muted-foreground">
                  {formatDate(currentData.updatedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
