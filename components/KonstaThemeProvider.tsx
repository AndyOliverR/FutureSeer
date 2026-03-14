"use client";

import { useState, useEffect } from "react";
import { KonstaProvider } from "konsta/react";

function getDesignSystemTheme(): "ios" | "material" {
  if (typeof document === "undefined") return "material";
  const ds = document.documentElement.getAttribute("data-design-system");
  return ds === "konsta-ios" ? "ios" : "material";
}

/**
 * Wraps children with KonstaProvider; theme is driven by data-design-system
 * (set by DesignSystemSync: konsta-ios → iOS styling, material/devotionist → material).
 */
export function KonstaThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"ios" | "material">(getDesignSystemTheme);

  useEffect(() => {
    setTheme(getDesignSystemTheme());
    const observer = new MutationObserver(() => setTheme(getDesignSystemTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-design-system"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <KonstaProvider theme={theme} dark>
      {children}
    </KonstaProvider>
  );
}
