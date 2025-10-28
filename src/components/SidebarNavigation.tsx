import React, { useEffect, useRef, useState } from 'react';

export interface SidebarItem {
  id: string;
  label: string;
}

interface SidebarNavigationProps {
  items: SidebarItem[];
  activeItem: string;
  onSelect: (itemId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const getInitial = (label: string) => {
  const trimmed = label.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
};

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  items,
  activeItem,
  onSelect,
  isOpen,
  onToggle,
}) => {
  const [focusIndex, setFocusIndex] = useState(() => {
    const currentIndex = items.findIndex((item) => item.id === activeItem);
    return currentIndex >= 0 ? currentIndex : 0;
  });
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const liveRegionRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
  }, [items.length]);

  useEffect(() => {
    const currentIndex = items.findIndex((item) => item.id === activeItem);
    setFocusIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [activeItem, items]);

  useEffect(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = isOpen ? 'Sidebar expanded' : 'Sidebar collapsed';
    }
  }, [isOpen]);

  const focusItem = (index: number) => {
    const total = items.length;

    if (total === 0) {
      return;
    }

    const nextIndex = (index + total) % total;
    itemRefs.current[nextIndex]?.focus();
    setFocusIndex(nextIndex);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        focusItem(index + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        focusItem(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusItem(0);
        break;
      case 'End':
        event.preventDefault();
        focusItem(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelect(items[index]?.id ?? activeItem);
        break;
      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          onToggle();
        }
        break;
      default:
    }
  };

  return (
    <aside
      className={`hidden border-r border-slate-200 bg-white transition-all duration-200 ease-out focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-800 dark:bg-slate-950 md:flex ${isOpen ? 'w-64' : 'w-20'}`}
      aria-label="Dashboard sections"
    >
      <div className="flex w-full flex-col gap-4 px-4 py-6">
        <div className="flex items-center justify-between">
          <h2 id="sidebar-heading" className="text-base font-semibold text-slate-800 dark:text-slate-100">
            Navigation
          </h2>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-controls="dashboard-sections"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            aria-label={isOpen ? 'Collapse sidebar navigation' : 'Expand sidebar navigation'}
          >
            {isOpen ? '⟨' : '⟩'}
          </button>
        </div>
        <nav id="dashboard-sections" aria-labelledby="sidebar-heading">
          <ul role="list" className="space-y-1">
            {items.map((item, index) => {
              const isActive = activeItem === item.id;
              const initial = getInitial(item.label);

              return (
                <li key={item.id} className="list-none">
                  <button
                    type="button"
                    ref={(element) => {
                      itemRefs.current[index] = element;
                    }}
                    tabIndex={focusIndex === index ? 0 : -1}
                    className={`group inline-flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-sm dark:bg-sky-500'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => onSelect(item.id)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    onFocus={() => setFocusIndex(index)}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-8 w-8 items-center justify-center rounded-md text-base font-semibold transition ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700 group-hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:group-hover:bg-slate-600'
                      }`}
                    >
                      {initial}
                    </span>
                    <span className={isOpen ? 'block text-left' : 'sr-only'}>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <span ref={liveRegionRef} aria-live="polite" className="sr-only" />
      </div>
    </aside>
  );
};

export default SidebarNavigation;
