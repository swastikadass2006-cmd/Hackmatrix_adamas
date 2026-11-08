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
        'flex border-b border-zinc-800/80 overflow-x-auto no-scrollbar gap-1',
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
              'flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 active:opacity-80 disabled:opacity-50 border-b-2 whitespace-nowrap',
              isActive
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            )}
          >
            {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.5 text-xs rounded-full font-semibold',
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-zinc-800 text-zinc-400'
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

