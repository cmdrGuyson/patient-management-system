"use client";

import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type DataTableSkeletonProps = {
  columns: number;
  rows?: number;
  withToolbar?: boolean;
  withPagination?: boolean;
};

export function DataTableSkeleton({
  columns,
  rows = 10,
  withToolbar = true,
  withPagination = true,
}: DataTableSkeletonProps) {
  const columnArray = React.useMemo(
    () => Array.from({ length: Math.max(1, columns) }),
    [columns]
  );
  const rowArray = React.useMemo(
    () => Array.from({ length: Math.max(1, rows) }),
    [rows]
  );

  return (
    <div className="w-full">
      {withToolbar && (
        <div className="flex items-center py-4">
          <Skeleton className="h-10 w-64" />
          <div className="ml-auto">
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      )}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columnArray.map((_, idx) => (
                <TableHead key={idx}>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowArray.map((_, rIdx) => (
              <TableRow key={rIdx}>
                {columnArray.map((_, cIdx) => (
                  <TableCell key={cIdx}>
                    <Skeleton
                      className={
                        // Provide subtle width variance across columns
                        cIdx % 3 === 0
                          ? "h-4 w-[140px]"
                          : cIdx % 3 === 1
                            ? "h-4 w-[180px]"
                            : "h-4 w-[120px]"
                      }
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {withPagination && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-4 w-28" />
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Skeleton className="hidden h-8 w-8 lg:block" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="hidden h-8 w-8 lg:block" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
