import React, { useEffect, useRef, useState } from 'react';

export interface SidebarNavItem {
  id: string;
  label: string;
}

interface SidebarNavProps {
  items: SidebarNavItem[];
  activeItem: string;
  onSelect: (itemId: string) => void;
  isDesktopExpanded: boolean;
  onDesktopToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

type NavContext = 'desktop' | 'mobile';

type ButtonRef = Array<HTMLButtonElement | null>;

const getInitial = (label: string) => {
  const trimmed = label.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
};

const SidebarNav: React.FC<SidebarNavProps> = ({
  items,
  activeItem,
  onSelect,
  isDesktopExpanded,
  onDesktopToggle,
  isMobileOpen,
  onMobileClose,
}) => {
  const desktopItemRefs = useRef<ButtonRef>([]);
  const mobileItemRefs = useRef<ButtonRef>([]);
  const [desktopFocusIndex, setDesktopFocusIndex] = useState(() => {
    const index = items.findIndex((item) => item.id === activeItem);
    return index >= 0 ? index : 0;
  });
  const [mobileFocusIndex, setMobileFocusIndex] = useState(() => {
    const index = items.findIndex((item) => item.id === activeItem);
    return index >= 0 ? index : 0;
  });
  const liveRegionRef = useRef<HTMLSpanElement | null>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    desktopItemRefs.current = desktopItemRefs.current.slice(0, items.length);
    mobileItemRefs.current = mobileItemRefs.current.slice(0, items.length);
  }, [items.length]);

  useEffect(() => {
    const index = items.findIndex((item) => item.id === activeItem);
    const nextIndex = index >= 0 ? index : 0;
    setDesktopFocusIndex(nextIndex);
    setMobileFocusIndex(nextIndex);
  }, [activeItem, items]);

  useEffect(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = isDesktopExpanded ? 'Sidebar expanded' : 'Sidebar collapsed';
    }
  }, [isDesktopExpanded]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    if (!isMobileOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileOpen]);

  useEffect(() => {
    if (!isMobileOpen || typeof window === 'undefined') {
      return;
    }

    const timeout = window.setTimeout(() => {
      if (mobileCloseButtonRef.current) {
        mobileCloseButtonRef.current.focus();
        return;
      }

      const target = mobileItemRefs.current[mobileFocusIndex];
      target?.focus();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [isMobileOpen, mobileFocusIndex]);

  const getRefs = (context: NavContext) => (context === 'desktop' ? desktopItemRefs.current : mobileItemRefs.current);
  const getFocusIndexSetter = (context: NavContext) => (context === 'desktop' ? setDesktopFocusIndex : setMobileFocusIndex);

  const focusItem = (context: NavContext, index: number) => {
    const refs = getRefs(context);
    const total = items.length;

    if (total === 0) {
      return;
    }

    const nextIndex = (index + total) % total;
    refs[nextIndex]?.focus();

    getFocusIndexSetter(context)(nextIndex);
  };

  const handleKeyDown = (
    context: NavContext,
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        focusItem(context, index + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        focusItem(context, index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusItem(context, 0);
        break;
      case 'End':
        event.preventDefault();
        focusItem(context, items.length - 1);
        break;
      case 'Escape':
        if (context === 'mobile') {
          event.preventDefault();
          onMobileClose();
        }
        break;
      case ' ': // Space
      case 'Enter': {
        event.preventDefault();
        const target = items[index];
        if (target) {
          handleSelect(context, target.id);
        }
        break;
      }
      default:
    }
  };

  const handleSelect = (context: NavContext, itemId: string) => {
    onSelect(itemId);

    const index = items.findIndex((item) => item.id === itemId);
    if (index >= 0) {
      getFocusIndexSetter(context)(index);
    }

    if (context === 'mobile') {
      onMobileClose();
    }
  };

  const renderNavList = (context: NavContext, headingId: string, isExpanded: boolean) => {
    const focusIndex = context === 'desktop' ? desktopFocusIndex : mobileFocusIndex;
    const refs = context === 'desktop' ? desktopItemRefs : mobileItemRefs;
    const showLabel = context === 'mobile' || isExpanded;

    const navClassName = context === 'desktop' ? 'mt-4 lg:mt-6' : 'mt-6';

    return (
      <nav aria-labelledby={headingId} className={navClassName}>
        <ul role="list" className="space-y-1">
          {items.map((item, index) => {
            const isActive = activeItem === item.id;
            const initial = getInitial(item.label);

            return (
              <li key={item.id} className="list-none">
                <button
                  type="button"
                  ref={(element) => {
                    refs.current[index] = element;
                  }}
                  tabIndex={focusIndex === index ? 0 : -1}
                  className={`group inline-flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary'
                      : 'text-foreground hover:bg-surface-subtle'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => handleSelect(context, item.id)}
                  onKeyDown={(event) => handleKeyDown(context, event, index)}
                  onFocus={() => getFocusIndexSetter(context)(index)}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-base font-semibold transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'bg-surface-subtle text-foreground group-hover:bg-surface-hover'
                    }`}
                  >
                    {initial}
                  </span>
                  <span className={showLabel ? 'block text-left' : 'sr-only'}>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  };

  return (
    <>
      {isMobileOpen ? (
        <>
          <div
            className="fixed inset-0 z-[55] bg-background/80 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
            onClick={onMobileClose}
          />
          <aside
            id="mobile-dashboard-sidebar"
            className="fixed inset-y-0 left-0 z-[60] flex w-72 max-w-full flex-col border-r border-border bg-surface px-4 py-6 shadow-xl focus:outline-none lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-sidebar-heading"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                onMobileClose();
              }
            }}
          >
            <div className="flex items-center justify-between">
              <h2 id="mobile-sidebar-heading" className="text-base font-semibold text-foreground">
                Navigation
              </h2>
              <button
                type="button"
                ref={mobileCloseButtonRef}
                onClick={onMobileClose}
                className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground shadow-sm transition-colors duration-200 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                Close
              </button>
            </div>
            {renderNavList('mobile', 'mobile-sidebar-heading', true)}
          </aside>
        </>
      ) : null}

      <aside
        className={`relative hidden border-r border-border bg-surface transition-[width] duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:flex lg:flex-col ${
          isDesktopExpanded ? 'lg:w-72' : 'lg:w-20'
        }`}
        aria-label="Dashboard sections"
      >
        <div className="flex h-full flex-col gap-6 px-4 py-6">
          <div className="flex items-center justify-between">
            <h2 id="desktop-sidebar-heading" className="text-base font-semibold text-foreground">
              Navigation
            </h2>
            <button
              type="button"
              onClick={onDesktopToggle}
              aria-expanded={isDesktopExpanded}
              aria-controls="desktop-navigation-list"
              className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground shadow-sm transition-colors duration-200 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              aria-label={isDesktopExpanded ? 'Collapse sidebar navigation' : 'Expand sidebar navigation'}
            >
              {isDesktopExpanded ? '⟨' : '⟩'}
            </button>
          </div>
          <div id="desktop-navigation-list" className="flex-1">
            {renderNavList('desktop', 'desktop-sidebar-heading', isDesktopExpanded)}
          </div>
          <span ref={liveRegionRef} aria-live="polite" className="sr-only" />
        </div>
      </aside>
    </>
  );
};

export default SidebarNav;
