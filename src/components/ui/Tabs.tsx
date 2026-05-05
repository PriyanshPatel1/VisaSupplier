"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  value?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, defaultTab, value, onChange, className = "" }: TabsProps) {
  const [active, setActive] = useState(value ?? defaultTab ?? tabs[0]?.id ?? "");
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const current = value ?? active;

  const updateIndicator = useCallback((id: string) => {
    const el = tabRefs.current[id];
    const container = containerRef.current;
    if (!el || !container) return;
    const elRect = el.getBoundingClientRect();
    const conRect = container.getBoundingClientRect();
    setIndicatorStyle({ left: elRect.left - conRect.left, width: elRect.width });
  }, []);

  useEffect(() => {
    updateIndicator(current);
  }, [current, updateIndicator]);

  const handleClick = (id: string) => {
    if (!value) setActive(id);
    onChange?.(id);
    updateIndicator(id);
  };

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="relative flex gap-1 bg-gray-100/80 rounded-2xl p-1"
        role="tablist"
      >
        {/* Animated indicator */}
        <div
          className="absolute top-1 bottom-1 bg-white rounded-xl shadow-sm transition-all duration-200 ease-out"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        />

        {tabs.map((tab) => {
          const isActive = current === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[tab.id] = el; }}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleClick(tab.id)}
              className={[
                "relative z-10 flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-colors duration-150 whitespace-nowrap",
                isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-700",
              ].join(" ")}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              {tab.label}
              {typeof tab.count === "number" && (
                <span
                  className={[
                    "ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    isActive
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-gray-200 text-gray-500",
                  ].join(" ")}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Tabs;
