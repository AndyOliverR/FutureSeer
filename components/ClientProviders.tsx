"use client";
import { AuthProvider } from "@/hooks/use-auth";
import { ActivityLogger } from "@/components/ActivityLogger";
import { TipJarProvider } from "@/components/TipJarContext";
import { ModalOpenProvider } from "@/components/ModalOpenContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ModalOpenProvider>
        <TipJarProvider>
          <ActivityLogger />
          {children}
        </TipJarProvider>
      </ModalOpenProvider>
    </AuthProvider>
  );
}