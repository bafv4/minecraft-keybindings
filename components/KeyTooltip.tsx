'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface KeyTooltipProps {
  children: React.ReactNode;
  content: {
    remap?: { from: string; to: string };
    actions?: string[];
    externalTool?: string;
    fingers?: string[];
  } | null;
  show: boolean;
  keyLabel?: string;
}

export function KeyTooltip({ children, content, show, keyLabel }: KeyTooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [showDelayed, setShowDelayed] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hasContent = content && (content.remap || (content.actions && content.actions.length > 0) || content.externalTool || (content.fingers && content.fingers.length > 0));

  // ホバーから300ms遅延してツールチップを表示
  useEffect(() => {
    if (show) {
      timeoutRef.current = setTimeout(() => {
        setShowDelayed(true);
      }, 300);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShowDelayed(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [show]);

  useEffect(() => {
    if (!showDelayed || !targetRef.current || !tooltipRef.current) return;

    const updatePosition = () => {
      if (!targetRef.current || !tooltipRef.current) return;

      const targetRect = targetRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      // Position above the target element
      let top = targetRect.top + scrollTop - tooltipRect.height - 10;
      let left = targetRect.left + scrollLeft + (targetRect.width / 2) - (tooltipRect.width / 2);

      // Adjust if tooltip goes off screen
      if (left < 10) left = 10;
      if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
      }
      if (top < scrollTop + 10) {
        // If no space above, show below
        top = targetRect.bottom + scrollTop + 10;
      }

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showDelayed, content]);

  // Always render children wrapped in a div with ref
  return (
    <>
      <div ref={targetRef}>
        {children}
      </div>
      {showDelayed && hasContent && typeof document !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 9999,
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div className="glass-card rounded-lg border-2 border-primary/20 shadow-xl p-2.5 min-w-[140px] max-w-[220px]">
            {/* Header */}
            <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-border/50">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <span className="font-semibold text-[11px]">{keyLabel || 'キー情報'}</span>
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              {/* Remap */}
              {content.remap && (
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] text-muted-foreground">リマップ</div>
                    <div className="text-[11px] font-medium truncate">
                      {content.remap.from} → {content.remap.to}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {content.actions && content.actions.length > 0 && (
                <div className="flex items-start gap-1.5">
                  <div className="w-4 h-4 rounded bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-2.5 h-2.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] text-muted-foreground">操作</div>
                    <div className="text-[11px] font-medium">{content.actions.join(', ')}</div>
                  </div>
                </div>
              )}

              {/* External Tool */}
              {content.externalTool && (
                <div className="flex items-start gap-1.5">
                  <div className="w-4 h-4 rounded bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] text-muted-foreground">外部ツール</div>
                    <div className="text-[11px] font-medium">{content.externalTool}</div>
                  </div>
                </div>
              )}

              {/* Fingers */}
              {content.fingers && content.fingers.length > 0 && (
                <div className="flex items-start gap-1.5">
                  <div className="w-4 h-4 rounded bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-2.5 h-2.5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] text-muted-foreground">指</div>
                    <div className="text-[11px] font-medium">{content.fingers.join(', ')}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Arrow */}
            <div
              className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-[rgb(var(--card))] border-r-2 border-b-2 border-primary/20"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
