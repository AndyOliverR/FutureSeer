"use client";
import { AuthProvider } from "@/hooks/use-auth";
import { MysticalProfileProvider } from "@/contexts/MysticalProfileContext";
import { ActivityLogger } from "@/components/ActivityLogger";
import { TipJarProvider } from "@/components/TipJarContext";
import { ModalOpenProvider } from "@/components/ModalOpenContext";
import { DesignSystemSync } from "@/components/DesignSystemSync";
import { KonstaThemeProvider } from "@/components/KonstaThemeProvider";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DesignSystemSync />
      <KonstaThemeProvider>
        <MysticalProfileProvider>
          <ModalOpenProvider>
            <TipJarProvider>
              <ActivityLogger />
              {children}
            </TipJarProvider>
          </ModalOpenProvider>
        </MysticalProfileProvider>
      </KonstaThemeProvider>
    </AuthProvider>
  );
}