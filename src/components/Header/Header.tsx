'use client';

import { useState, useRef, useEffect } from 'react';
import { MoonIcon, SunIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Profile from '@/components/Profile/Profile';

interface Model {
  name: string;
  endpoint: string;
}

interface HeaderProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
  models: Model[];
  selectedModel: Model;
  onSelectModel: (model: Model) => void;
}

export default function Header({
  isDarkMode,
  onThemeToggle,
  models,
  selectedModel,
  onSelectModel,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700 bg-[var(--background)] text-[var(--foreground)]">
      
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Image
          src="/next.svg"
          alt="Logo"
          width={32}
          height={32}
          className="rounded-full"
        />

        {/* Model selector dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
className="
      group flex items-center gap-1 px-3 py-2 rounded-lg
      bg-[var(--background)] text-[var(--foreground)]
      focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
    "          >
            {selectedModel.name}
            <ChevronDownIcon className="w-4 h-4 text-[var(--foreground)]" />
          </button>

          {dropdownOpen && (
            <div className="absolute mt-1 w-full rounded-lg bg-[var(--background)] shadow-lg z-50">
              {models.map((model) => (
                <div
                  key={model.name}
                  onClick={() => {
                    onSelectModel(model);
                    setDropdownOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                >
                  {model.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isDarkMode ? (
            <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <MoonIcon className="h-5 w-5 text-gray-300 dark:text-gray-900" />
          )}
        </button>

        {/* Profile */}
        <Profile />
      </div>
    </header>
  );
}
