'use client';

import { useState, ReactNode } from 'react';
import { HelpCircle, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface ContextualHelpProps {
  content: string;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'icon' | 'button' | 'inline';
  className?: string;
  children?: ReactNode;
}

export function ContextualHelp({
  content,
  title,
  placement = 'top',
  variant = 'icon',
  className = '',
  children,
}: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'inline' && children) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {children}
          </TooltipTrigger>
          <TooltipContent side={placement} className="max-w-xs">
            {title && <h4 className="font-semibold text-white mb-1">{title}</h4>}
            <p className="text-sm text-white/80">{content}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          {variant === 'button' ? (
            <Button
              variant="ghost"
              size="sm"
              className={`text-amber-400/70 hover:text-amber-400 ${className}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </Button>
          ) : (
            <button
              type="button"
              className={`inline-flex items-center justify-center text-amber-400/70 hover:text-amber-400 transition-colors ${className}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              aria-label="Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent side={placement} className="max-w-xs bg-[#020617] border-amber-400/50">
          {title && <h4 className="font-semibold text-white mb-2">{title}</h4>}
          <p className="text-sm text-white/80 leading-relaxed">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
