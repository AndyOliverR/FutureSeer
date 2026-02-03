"use client";

import React from "react";
import { NodeMode } from "@/lib/astrology";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface SettingsBarProps {
  nodeMode: NodeMode;
  onNodeModeChange: (mode: NodeMode) => void;
  chartStyle: "north" | "south" | "both";
  onChartStyleChange: (style: "north" | "south" | "both") => void;
  isLoading?: boolean;
  className?: string;
}

export default function SettingsBar({
  nodeMode,
  onNodeModeChange,
  chartStyle,
  onChartStyleChange,
  isLoading = false,
  className = ""
}: SettingsBarProps) {
  return (
    <div className={`bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-500/20 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Node Mode Toggle */}
          <div className="flex items-center space-x-3">
            <Label className="text-sm font-medium text-amber-100">
              Node Mode:
            </Label>
            <div className="inline-flex rounded-full bg-slate-700/50 p-1 border border-slate-600/50">
              <button
                onClick={() => onNodeModeChange("true")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  nodeMode === "true"
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                    : "text-slate-300 hover:text-amber-300 hover:bg-slate-600/50"
                }`}
              >
                True
              </button>
              <button
                onClick={() => onNodeModeChange("mean")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  nodeMode === "mean"
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                    : "text-slate-300 hover:text-amber-300 hover:bg-slate-600/50"
                }`}
              >
                Mean
              </button>
            </div>
            <div className="text-xs text-slate-300 max-w-xs">
              {nodeMode === "true" 
                ? "True Node: More accurate, accounts for lunar orbit perturbations. Toggle to see Rahu/Ketu position changes."
                : "Mean Node: Traditional calculation, smoother progression. Toggle to see Rahu/Ketu position changes."
              }
            </div>
          </div>

          {/* Chart Style Selector */}
          <div className="flex items-center space-x-3">
            <Label htmlFor="chart-style" className="text-sm font-medium text-amber-100">
              Chart Style:
            </Label>
            <Select value={chartStyle} onValueChange={onChartStyleChange}>
              <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-amber-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="north" className="text-amber-100 hover:bg-slate-700">North Indian</SelectItem>
                <SelectItem value="south" className="text-amber-100 hover:bg-slate-700">South Indian</SelectItem>
                <SelectItem value="both" className="text-amber-100 hover:bg-slate-700">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      </div>
    </div>
  );
}
