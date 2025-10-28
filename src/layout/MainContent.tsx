import React from 'react';

export interface MainContentSection {
  key: string;
  content: React.ReactNode;
  className?: string;
}

interface MainContentProps {
  sections: MainContentSection[];
}

const MainContent = React.forwardRef<HTMLElement, MainContentProps>(({ sections }, ref) => {
  return (
    <main
      id="main-content"
      ref={ref}
      tabIndex={-1}
      aria-label="Wallet dashboard content"
      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-6 xl:gap-8">
          {sections.map((section) => {
            const sectionClassName = section.className
              ? `col-span-full ${section.className}`
              : 'col-span-full';

            return (
              <div key={section.key} className={sectionClassName}>
                {section.content}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
});

MainContent.displayName = 'MainContent';

export default MainContent;
