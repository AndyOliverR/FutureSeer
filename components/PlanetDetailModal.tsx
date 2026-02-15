"use client";

import React from "react";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModalPortal } from "@/components/ui/ModalPortal";

interface PlanetDetailModalProps {
  planet: string | null;
  data: any;
  onClose: () => void;
}

export default function PlanetDetailModal({ planet, data, onClose }: PlanetDetailModalProps) {
  if (!planet || !data) return null;

  const planetNames: Record<string, string> = {
    sun: "Sun (Surya)",
    moon: "Moon (Chandra)",
    mercury: "Mercury (Budha)",
    venus: "Venus (Shukra)",
    mars: "Mars (Mangal)",
    jupiter: "Jupiter (Guru)",
    saturn: "Saturn (Shani)",
    rahu: "Rahu (North Node)",
    ketu: "Ketu (South Node)"
  };

  const getDignityBadge = () => {
    if (!data.dignity) return null;
    
    if (data.dignity.exalted) {
      return <Badge className="bg-green-600">Exalted (Very Strong)</Badge>;
    } else if (data.dignity.debilitated) {
      return <Badge className="bg-red-600">Debilitated (Weak)</Badge>;
    } else if (data.dignity.moolatrikona) {
      return <Badge className="bg-blue-600">Moolatrikona (Strong)</Badge>;
    } else if (data.dignity.ownSign) {
      return <Badge className="bg-indigo-600">Own Sign (Comfortable)</Badge>;
    } else {
      return <Badge variant="outline">Neutral</Badge>;
    }
  };

  return (
    <ModalPortal open={!!(planet && data)}>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <Card className="w-full max-w-md max-w-[90vw] max-h-[min(90dvh,90vh)] overflow-y-auto bg-slate-900 border-slate-700 text-white z-[10001]">
          <CardHeader className="relative shrink-0">
            <CardTitle className="text-amber-200 flex items-center justify-between">
              <span>{planetNames[planet] || planet}</span>
              <button
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0"
                aria-label="Close"
              >
                <span className="shrink-0"><X className="w-5 h-5" /></span>
              </button>
            </CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          {/* Dignity */}
          <div>
            <h4 className="text-sm font-semibold text-amber-200 mb-2">Dignity</h4>
            {getDignityBadge()}
            {data.dignity && (
              <p className="text-sm text-gray-400 mt-2">
                Strength: {data.dignity.strength}
              </p>
            )}
          </div>

          {/* Position */}
          <div>
            <h4 className="text-sm font-semibold text-amber-200 mb-2">Position</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-400">Sign:</span>
                <span className="ml-2 text-white">{data.signName}</span>
              </div>
              <div>
                <span className="text-gray-400">Degree:</span>
                <span className="ml-2 text-white">{data.degreeInSign?.toFixed(2)}°</span>
              </div>
              <div>
                <span className="text-gray-400">Longitude:</span>
                <span className="ml-2 text-white">{data.lonSidereal?.toFixed(2)}°</span>
              </div>
              {data.lat !== undefined && (
                <div>
                  <span className="text-gray-400">Latitude:</span>
                  <span className="ml-2 text-white">{data.lat?.toFixed(2)}°</span>
                </div>
              )}
            </div>
          </div>

          {/* Nakshatra */}
          <div>
            <h4 className="text-sm font-semibold text-amber-200 mb-2">Nakshatra</h4>
            <div className="text-sm">
              <span className="text-white">{data.nakshatra}</span>
              <span className="text-gray-400 ml-2">Pada {data.nakshatraPada}</span>
            </div>
          </div>

          {/* Tropical vs Sidereal */}
          {data.lon !== undefined && (
            <div>
              <h4 className="text-sm font-semibold text-amber-200 mb-2">Coordinates</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">Tropical:</span>
                  <span className="ml-2 text-white">{data.lon?.toFixed(2)}°</span>
                </div>
                <div>
                  <span className="text-gray-400">Sidereal:</span>
                  <span className="ml-2 text-white">{data.lonSidereal?.toFixed(2)}°</span>
                </div>
              </div>
            </div>
          )}

          {/* Distance (for physical planets) */}
          {data.dist && (
            <div>
              <h4 className="text-sm font-semibold text-amber-200 mb-2">Distance</h4>
              <p className="text-sm text-white">{data.dist?.toFixed(4)} AU</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-gray-400">
              Julian Day: {data.jd?.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Calculation Status: {data.valid ? "✅ Valid" : "❌ Invalid"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
    </ModalPortal>
  );
}
