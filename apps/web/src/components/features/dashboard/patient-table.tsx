"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";

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
import { DataTable } from "../common/data-table";
import { Patient } from "@/types";

import patientData from "@/app/(dashboard)/patients/data.json";

const data: Patient[] = patientData;

// Helper function to get the appropriate sort icon
const getSortIcon = (column: any) => {
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
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          First Name
          {getSortIcon(column)}
        </Button>
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
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Name
          {getSortIcon(column)}
        </Button>
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
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          {getSortIcon(column)}
        </Button>
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
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date of Birth
          {getSortIcon(column)}
        </Button>
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
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          {getSortIcon(column)}
        </Button>
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

      return (
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
            <DropdownMenuItem>View patient details</DropdownMenuItem>
            <DropdownMenuItem>Edit patient</DropdownMenuItem>
            <DropdownMenuItem>Delete patient</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
