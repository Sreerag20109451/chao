"use client";

import { useEffect, useMemo, useState } from "react";

export interface TypewriterSegment {
  text: string;
  className?: string;
}

interface TypewriterTextProps {
  segments: TypewriterSegment[];
  speedMs?: number;
  className?: string;
  showCaret?: boolean;
}

export default function TypewriterText({
  segments,
  speedMs = 45,
  className = "",
  showCaret = true,
}: TypewriterTextProps) {
  const [typedCount, setTypedCount] = useState(0);

  const fullText = useMemo(() => segments.map((segment) => segment.text).join(""), [segments]);

  useEffect(() => {
    setTypedCount(0);
    const interval = window.setInterval(() => {
      setTypedCount((prev) => {
        if (prev >= fullText.length) {
          window.clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, speedMs);

    return () => window.clearInterval(interval);
  }, [fullText, speedMs]);

  let charsLeft = typedCount;

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        const visibleCount = Math.max(0, Math.min(charsLeft, segment.text.length));
        charsLeft -= visibleCount;
        return (
          <span key={`${segment.text}-${index}`} className={segment.className}>
            {segment.text.slice(0, visibleCount)}
          </span>
        );
      })}
      {showCaret && typedCount < fullText.length && (
        <span className="typewriter-caret" aria-hidden="true">
          |
        </span>
      )}
    </span>
  );
}

