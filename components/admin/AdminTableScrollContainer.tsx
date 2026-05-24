'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AdminTableScrollContainerProps {
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  maxHeightClassName?: string;
}

/**
 * Wide admin tables: horizontal scrollbar pinned above the body (synced), so admins
 * can reach permission columns without scrolling to the bottom of a long user list.
 */
export function AdminTableScrollContainer({
  children,
  className,
  bodyClassName,
  maxHeightClassName = 'max-h-[60vh]',
}: AdminTableScrollContainerProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const syncing = useRef(false);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const update = () => setScrollWidth(inner.scrollWidth);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [children]);

  const syncScrollLeft = useCallback((source: 'top' | 'body') => {
    const top = topRef.current;
    const body = bodyRef.current;
    if (!top || !body || syncing.current) return;
    syncing.current = true;
    if (source === 'top') {
      body.scrollLeft = top.scrollLeft;
    } else {
      top.scrollLeft = body.scrollLeft;
    }
    requestAnimationFrame(() => {
      syncing.current = false;
    });
  }, []);

  return (
    <div className={cn('space-y-1', className)}>
      <div
        ref={topRef}
        className="admin-table-scroll-top overflow-x-auto overflow-y-hidden rounded-t-md border border-b-0 border-slate-600/50 bg-slate-800/40"
        onScroll={() => syncScrollLeft('top')}
        aria-label="Scroll table horizontally"
      >
        <div style={{ width: scrollWidth || '100%', height: 1 }} aria-hidden="true" />
      </div>
      <div
        ref={bodyRef}
        className={cn(
          'admin-table-scroll-body overflow-x-auto overflow-y-auto rounded-b-md border border-slate-600/50',
          maxHeightClassName,
          bodyClassName,
        )}
        onScroll={() => syncScrollLeft('body')}
      >
        <div ref={innerRef}>{children}</div>
      </div>
    </div>
  );
}
