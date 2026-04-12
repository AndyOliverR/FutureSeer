"use client";

import React, { useState, useEffect, useRef } from "react";
import { stripAttributionForDisplay } from "@/lib/attribution/attributionStamp";

export interface SlowRevealTextProps {
  content: string;
  minThinkingMs?: number;
  delayPerWord?: number;
  thinkingLabel?: string;
  className?: string;
  onComplete?: () => void;
}

const DEFAULT_THINKING_MS = 2000;
const DEFAULT_DELAY_PER_WORD = 85;
const DEFAULT_THINKING_LABEL = "Consulting the stars...";

export function SlowRevealText({
  content,
  minThinkingMs = DEFAULT_THINKING_MS,
  delayPerWord = DEFAULT_DELAY_PER_WORD,
  thinkingLabel = DEFAULT_THINKING_LABEL,
  className = "",
  onComplete,
}: SlowRevealTextProps) {
  const cleaned = stripAttributionForDisplay(content);
  const [phase, setPhase] = useState<"thinking" | "revealing" | "done">("thinking");
  const [revealedText, setRevealedText] = useState("");
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!cleaned.trim()) {
      const t = setTimeout(() => {
        setPhase("done");
        setRevealedText("");
        onCompleteRef.current?.();
      }, minThinkingMs);
      return () => clearTimeout(t);
    }

    const thinkingTimer = setTimeout(() => {
      setPhase("revealing");
    }, minThinkingMs);

    return () => clearTimeout(thinkingTimer);
  }, [cleaned, minThinkingMs]);

  useEffect(() => {
    if (phase !== "revealing") return;

    const words = cleaned.trim().split(/\s+/);
    if (words.length === 0) {
      setPhase("done");
      onCompleteRef.current?.();
      return;
    }

    let wordIndex = 0;
    const interval = setInterval(() => {
      wordIndex += 1;
      const portion = words.slice(0, wordIndex).join(" ");
      setRevealedText(portion);

      if (wordIndex >= words.length) {
        clearInterval(interval);
        setPhase("done");
        onCompleteRef.current?.();
      }
    }, delayPerWord);

    return () => clearInterval(interval);
  }, [phase, cleaned, delayPerWord]);

  if (phase === "thinking") {
    return (
      <span className={className}>
        {thinkingLabel}
      </span>
    );
  }

  if (phase === "revealing" || phase === "done") {
    return (
      <span className={className}>
        {phase === "done" ? cleaned : revealedText}
      </span>
    );
  }

  return null;
}
