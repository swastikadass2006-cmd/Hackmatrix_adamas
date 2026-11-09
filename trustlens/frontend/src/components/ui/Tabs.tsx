import React from 'react';
import { cn } from '../../lib/utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex p-1 bg-tl-card border border-tl-border rounded-xl overflow-x-auto no-scrollbar gap-1 shadow-panel',
        className
      )}
    >
      {items.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap',
              isActive
                ? 'bg-tl-elevated text-tl-text-primary shadow-sm border border-tl-border-active'
                : 'text-tl-text-secondary hover:text-tl-text-primary hover:bg-tl-hover/40'
            )}
          >
            {tab.icon && <span className="w-3.5 h-3.5 shrink-0 text-tl-cyan">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 text-[10px] font-mono rounded-full font-semibold',
                  isActive
                    ? 'bg-tl-cyan/20 text-tl-cyan'
                    : 'bg-tl-panel text-tl-text-muted'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
