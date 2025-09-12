"use client";

import * as React from "react";
import { Column, ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTable } from "../common/data-table";
import { Patient } from "@/types";

import patientData from "@/app/(dashboard)/patients/data.json";
import { Can } from "../common/can";
import { PERMISSIONS } from "@/lib/auth";

const data: Patient[] = patientData;

// Helper function to get the appropriate sort icon
const getSortIcon = (column: Column<Patient>) => {
  const sortDirection = column.getIsSorted();
  if (sortDirection === "asc") return <ArrowUp className="ml-2 h-4 w-4" />;
  if (sortDirection === "desc") return <ArrowDown className="ml-2 h-4 w-4" />;
  return <ArrowUpDown className="ml-2 h-4 w-4" />;
};

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "firstName",
    header: ({ column }) => {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              First Name
              {getSortIcon(column)}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sort by first name</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("firstName")}</div>
    ),
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Last Name
              {getSortIcon(column)}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sort by last name</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("lastName")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Email
              {getSortIcon(column)}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sort by email</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
    cell: ({ row }) => <div>{row.getValue("phoneNumber")}</div>,
  },
  {
    accessorKey: "dob",
    header: ({ column }) => {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Date of Birth
              {getSortIcon(column)}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sort by date of birth</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    cell: ({ row }) => {
      const dob = new Date(row.getValue("dob"));
      const formatted = dob.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Created
              {getSortIcon(column)}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sort by creation date</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    cell: ({ row }) => {
      const createdAt = new Date(row.getValue("createdAt"));
      const formatted = createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return <div>{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const patient = row.original;

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useRouter();

      const handleViewDetails = () => {
        router.push(`/patients/${patient.id}`);
      };

      const handleEditPatient = () => {
        router.push(`/patients/${patient.id}?edit=true`);
      };

      return (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Can perform={PERMISSIONS.PATIENT_VIEW}>
                <DropdownMenuItem onClick={handleViewDetails}>
                  View patient details
                </DropdownMenuItem>
              </Can>
              <Can perform={PERMISSIONS.PATIENT_UPDATE}>
                <DropdownMenuItem onClick={handleEditPatient}>
                  Edit patient
                </DropdownMenuItem>
              </Can>
              <Can perform={PERMISSIONS.PATIENT_DELETE}>
                <DropdownMenuItem>Delete patient</DropdownMenuItem>
              </Can>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export function PatientTable() {
  return (
    <DataTable
      columns={columns}
      data={data}
      filterableColumns={["firstName", "lastName", "email", "phoneNumber"]}
    />
  );
}
