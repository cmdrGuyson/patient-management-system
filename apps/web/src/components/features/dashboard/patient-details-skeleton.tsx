"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function PatientDetailsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0 overflow-hidden">
      {/* Header area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 min-w-0">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="mt-2">
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-40" />
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-56" />
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-40 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-48" />
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
