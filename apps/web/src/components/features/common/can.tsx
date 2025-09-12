"use client";

import { useAuth } from "@/contexts/auth-context";

interface CanProps {
  children: React.ReactNode;
  perform: string;
  fallback?: React.ReactNode;
}

export function Can({ children, perform, fallback = null }: CanProps) {
  const { hasPermission } = useAuth();

  return hasPermission(perform) ? <>{children}</> : <>{fallback}</>;
}
