"use client";
import { AuthProvider } from "@/hooks/use-auth";
import { ActivityLogger } from "@/components/ActivityLogger";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ActivityLogger />
      {children}
    </AuthProvider>
  );
}