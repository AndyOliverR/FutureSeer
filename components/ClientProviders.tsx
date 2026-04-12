"use client";
import { AuthProvider } from "@/hooks/use-auth";
import { MysticalProfileProvider } from "@/contexts/MysticalProfileContext";
import { MysticalPipelineRefreshBanner } from "@/components/MysticalPipelineRefreshBanner";
import { ActivityLogger } from "@/components/ActivityLogger";
import { TipJarProvider } from "@/components/TipJarContext";
import { ModalOpenProvider } from "@/components/ModalOpenContext";
import { DesignSystemSync } from "@/components/DesignSystemSync";
import { KonstaThemeProvider } from "@/components/KonstaThemeProvider";
import { ClientErrorTelemetry } from "@/components/ClientErrorTelemetry";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ClientErrorTelemetry />
      <DesignSystemSync />
      <KonstaThemeProvider>
        <MysticalProfileProvider>
          <MysticalPipelineRefreshBanner />
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