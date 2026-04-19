import type { AppTab } from '../types';
import type { ReactNode } from 'react';

interface TabBarProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

const TABS: { value: AppTab; label: string; icon: ReactNode }[] = [
  {
    value: 'kitchen',
    label: 'Kitchen',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    ),
  },
  {
    value: 'bar',
    label: 'Bar',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M5 14.5l-.94.94a1.5 1.5 0 001.06 2.56h13.76a1.5 1.5 0 001.06-2.56L19 14.5m-14 0h14" />
      </svg>
    ),
  },
];

export default function TabBar({ active, onChange }: TabBarProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-xl bg-gray-100 dark:bg-[#252525] p-1 gap-1">
        {TABS.map((tab) => {
          const isActive = active === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
                focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1
                dark:focus:ring-offset-[#1a1a1a]
                ${
                  isActive
                    ? 'bg-white dark:bg-[#353535] text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              aria-pressed={isActive}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
