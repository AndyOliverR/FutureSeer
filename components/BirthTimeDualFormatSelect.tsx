"use client"

import { useId } from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  hourOptionsForSelect,
  parseHourMinuteFromTimeString,
  toHHmm,
} from "@/lib/birthTime12h24hLabels"

export interface BirthTimeDualFormatSelectProps {
  /** Stored as HH:mm (24h), same as native time input */
  value: string
  onChange: (next: string) => void
  id?: string
  className?: string
  /** Applied to both selects */
  selectClassName?: string
  disabled?: boolean
  /** Show "Unknown time" — uses noon local as placeholder for chart math (common convention) */
  showUnknownCheckbox?: boolean
  unknownTime?: boolean
  onUnknownTimeChange?: (unknown: boolean) => void
  unknownUsesNoon?: boolean
  /** When false, hides the DST/helper line (parent may show its own copy). */
  showFooterHint?: boolean
}

export function BirthTimeDualFormatSelect({
  value,
  onChange,
  id,
  className = "",
  selectClassName = "",
  disabled = false,
  showUnknownCheckbox = false,
  unknownTime = false,
  onUnknownTimeChange,
  unknownUsesNoon = true,
  showFooterHint = true,
}: BirthTimeDualFormatSelectProps) {
  const autoId = useId()
  const baseId = id ?? `birth-time-${autoId}`
  const effective = unknownTime ? (unknownUsesNoon ? "12:00" : "00:00") : value
  const { hour, minute } = parseHourMinuteFromTimeString(effective || "12:00")
  const hourOptions = hourOptionsForSelect()
  const blocked = disabled || unknownTime

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <select
          id={`${baseId}-hour`}
          aria-label="Birth hour (24h with 12h hint)"
          disabled={blocked}
          value={hour}
          onChange={(e) => {
            const nh = Number(e.target.value)
            onChange(toHHmm(nh, minute))
          }}
          className={`${selectClassName} [&>option]:bg-white [&>option]:text-slate-900`}
        >
          {hourOptions.map(({ value: hv, label }) => (
            <option key={hv} value={hv}>
              {label}
            </option>
          ))}
        </select>
        <span className="text-muted-foreground select-none" aria-hidden>
          :
        </span>
        <select
          id={`${baseId}-minute`}
          aria-label="Birth minute"
          disabled={blocked}
          value={minute}
          onChange={(e) => {
            const nm = Number(e.target.value)
            onChange(toHHmm(hour, nm))
          }}
          className={`${selectClassName} [&>option]:bg-white [&>option]:text-slate-900`}
        >
          {Array.from({ length: 60 }, (_, i) => (
            <option key={i} value={i}>
              {String(i).padStart(2, "0")}
            </option>
          ))}
        </select>
      </div>
      {showUnknownCheckbox && onUnknownTimeChange && (
        <div className="flex items-center gap-2">
          <Checkbox
            id={`${baseId}-unknown`}
            checked={unknownTime}
            onCheckedChange={(c) => {
              const next = c === true
              onUnknownTimeChange(next)
              if (next) {
                onChange(unknownUsesNoon ? "12:00" : "00:00")
              }
            }}
          />
          <Label htmlFor={`${baseId}-unknown`} className="text-sm font-normal cursor-pointer">
            Unknown time (uses {unknownUsesNoon ? "12:00" : "00:00"} for calculations)
          </Label>
        </div>
      )}
      {showFooterHint && (
        <p className="text-xs text-white/60">
          Local birth time; hour shows 24h and 12h together. DST is applied from your birth place when you save coordinates.
        </p>
      )}
    </div>
  )
}
