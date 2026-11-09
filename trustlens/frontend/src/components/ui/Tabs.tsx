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
        'flex p-1.5 bg-[#0E1520]/70 backdrop-blur-xl border border-white/[0.07] rounded-xl overflow-x-auto no-scrollbar gap-1 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]',
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
              'flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap select-none',
              isActive
                ? 'bg-[#162235]/90 text-tl-text-primary shadow-[0_0_15px_rgba(67,185,219,0.2)] border border-tl-cyan/30'
                : 'text-tl-text-muted hover:text-tl-text-primary hover:bg-white/[0.04]'
            )}
          >
            {tab.icon && (
              <span className={cn('w-3.5 h-3.5 shrink-0 transition-colors', isActive ? 'text-tl-cyan' : 'text-tl-text-muted')}>
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.5 text-[10px] font-mono rounded-full font-semibold',
                  isActive
                    ? 'bg-tl-cyan/20 text-tl-cyan'
                    : 'bg-white/[0.05] text-tl-text-muted'
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
