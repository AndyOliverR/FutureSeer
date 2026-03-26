"use client";

import { useEffect, useState } from "react";
import { Cloud } from "lucide-react";

type WeatherPayload = {
  enabled: boolean;
  data?: {
    tempC: number;
    feelsLikeC: number;
    description: string;
    iconCode: string;
    locationLabel: string;
  };
  error?: string;
};

export function DailyWeatherCard({
  lat,
  lon,
}: {
  lat: number;
  lon: number;
}) {
  const [state, setState] = useState<WeatherPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/integrations/weather?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`
        );
        const json = (await res.json()) as WeatherPayload;
        if (!cancelled) setState(json);
      } catch {
        if (!cancelled) setState({ enabled: false, error: "unavailable" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  if (!state?.enabled || !state.data) return null;

  const { data } = state;
  const iconUrl = `https://openweathermap.org/img/wn/${data.iconCode}@2x.png`;

  return (
    <div className="glass-card rounded-2xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-3">
        {/* OpenWeather static icon host; not in next/image remotePatterns by default */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconUrl} alt="" className="w-14 h-14" width={56} height={56} />
        <div>
          <div className="flex items-center gap-2 text-soft/80 text-sm uppercase tracking-widest">
            <Cloud className="w-4 h-4" aria-hidden />
            Local sky
          </div>
          <div className="text-3xl font-semibold gold-glow">{Math.round(data.tempC)}°C</div>
          <div className="text-soft/70 text-sm">Feels like {Math.round(data.feelsLikeC)}°C</div>
        </div>
      </div>
      <div className="flex-1 text-soft leading-relaxed">
        <p className="capitalize">{data.description}</p>
        <p className="text-soft/60 text-xs mt-1">
          {data.locationLabel} — based on your birth place coordinates. Weather data © OpenWeather.
        </p>
      </div>
    </div>
  );
}
