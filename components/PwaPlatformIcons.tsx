import type { ReactNode } from "react";

function OsMark({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex flex-col items-center gap-1 min-w-[3rem] text-surface-on-variant">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-container text-surface-on">
        {children}
      </span>
      <span className="text-[10px] uppercase tracking-wide leading-none">{label}</span>
    </span>
  );
}

/** Simple platform glyphs (not official store badges). */
export function PwaPlatformIcons() {
  return (
    <div
      className="flex flex-wrap items-end gap-2"
      role="img"
      aria-label="Works on iPhone, Android, Windows, macOS, Linux, and ChromeOS"
    >
      <img
        src="/badges/app-store-dark.svg"
        alt=""
        width={124}
        height={40}
        className="block h-10 w-auto dark:hidden"
        loading="lazy"
      />
      <img
        src="/badges/app-store-light.svg"
        alt=""
        width={124}
        height={40}
        className="hidden h-10 w-auto dark:block"
        loading="lazy"
      />
      <img
        src="/badges/google-play-dark.svg"
        alt=""
        width={135}
        height={40}
        className="block h-10 w-auto dark:hidden"
        loading="lazy"
      />
      <img
        src="/badges/google-play-light.svg"
        alt=""
        width={135}
        height={40}
        className="hidden h-10 w-auto dark:block"
        loading="lazy"
      />
      <OsMark label="Windows">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M3 3h8.2v8.2H3V3zm9.8 0H21v8.2h-8.2V3zM3 12.8h8.2V21H3v-8.2zm9.8 0H21V21h-8.2v-8.2z"
          />
        </svg>
      </OsMark>
      <OsMark label="macOS">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5V15H4V5.5zM2 17h20v1.5A1.5 1.5 0 0 1 20.5 20h-17A1.5 1.5 0 0 1 2 18.5V17z"
          />
        </svg>
      </OsMark>
      <OsMark label="Linux">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2.5c-1.4 0-2.6 1.3-2.8 3-.2 1.3.3 2.6 1.2 3.4-.8.4-1.4 1.1-1.6 2L7.4 13c-.5 1.4-.2 2.9.8 4 .3.3.4.8.2 1.2l-.8 1.5c-.3.6 0 1.4.7 1.6l1.4.5c.5.2 1.1 0 1.4-.5l.4-.7c.3.4.8.6 1.3.6h.4c.5 0 1-.2 1.3-.6l.4.7c.3.5.9.7 1.4.5l1.4-.5c.7-.2 1-1 .7-1.6l-.8-1.5c-.2-.4-.1-.9.2-1.2 1-1.1 1.3-2.6.8-4l-1.4-2.1c-.2-.9-.8-1.6-1.6-2 .9-.8 1.4-2.1 1.2-3.4C14.6 3.8 13.4 2.5 12 2.5zm-1.6 4.2c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6S12.9 8.3 12 8.3s-1.6-.7-1.6-1.6zm-.9 2.7c.3.1.6.1.9.1h1.2c.3 0 .6 0 .9-.1.4.5.6 1.1.5 1.7l-.4 1.6H9.4L9 11.1c-.1-.6.1-1.2.5-1.7z"
          />
        </svg>
      </OsMark>
      <OsMark label="ChromeOS">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="12" r="3.2" fill="currentColor" />
          <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            d="M12 3.8h8.1M5.6 7.4l4 7.1M18.4 7.4l-4 7.1"
          />
        </svg>
      </OsMark>
    </div>
  );
}
