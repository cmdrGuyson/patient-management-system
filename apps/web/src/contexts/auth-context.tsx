"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getPermissionsForRole, isTokenExpired, Role } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

interface User {
  id: number;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const EMPTY_PERMISSIONS = new Set<string>();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] =
    useState<Set<string>>(EMPTY_PERMISSIONS);

  const router = useRouter();
  const queryClient = useQueryClient();

  const refreshUser = useCallback(async (): Promise<void> => {
    if (!token || isTokenExpired(token)) {
      setUser(null);
      return;
    }

    try {
      const response = await api.get("/auth/profile");
      setUser(response.data);
      setPermissions(getPermissionsForRole(response.data.role));
    } catch (error: unknown) {
      setUser(null);

      // Clear token if invalid
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setToken(null);
          localStorage.removeItem("token");
          setPermissions(EMPTY_PERMISSIONS);
          queryClient.clear();
        }
      }
    }
  }, [token, queryClient]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch user profile when token changes
  useEffect(() => {
    if (token && !isTokenExpired(token)) {
      refreshUser();
    } else if (token && isTokenExpired(token)) {
      setToken(null);
      localStorage.removeItem("token");
      setUser(null);
      setPermissions(EMPTY_PERMISSIONS);
      queryClient.clear();
    }
    setIsLoading(false);
  }, [token, refreshUser, queryClient]);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    router.push("/patients");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    router.push("/login");
    setPermissions(EMPTY_PERMISSIONS);
    queryClient.clear();
  };

  const hasPermission = (permission: string): boolean => {
    return permissions.has(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isLoading,
        refreshUser,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
