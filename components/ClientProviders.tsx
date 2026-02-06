"use client";
import { AuthProvider } from "@/hooks/use-auth";
import { ActivityLogger } from "@/components/ActivityLogger";
import { TipJarProvider } from "@/components/TipJarContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TipJarProvider>
        <ActivityLogger />
        {children}
      </TipJarProvider>
    </AuthProvider>
  );
}