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
      className={`hidden border-r border-border bg-surface transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background md:flex ${isOpen ? 'w-64' : 'w-20'}`}
      aria-label="Dashboard sections"
    >
      <div className="flex w-full flex-col gap-4 px-4 py-6">
        <div className="flex items-center justify-between">
          <h2 id="sidebar-heading" className="text-base font-semibold text-foreground">
            Navigation
          </h2>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-controls="dashboard-sections"
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground shadow-sm transition-colors duration-200 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
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
                    className={`group inline-flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary'
                        : 'text-foreground hover:bg-surface-subtle'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => onSelect(item.id)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    onFocus={() => setFocusIndex(index)}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-8 w-8 items-center justify-center rounded-md text-base font-semibold transition-colors duration-200 ${
                        isActive
                          ? 'bg-primary/20 text-primary'
                          : 'bg-surface-subtle text-foreground group-hover:bg-surface-hover'
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
