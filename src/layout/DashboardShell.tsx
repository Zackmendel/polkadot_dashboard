import React from 'react';

interface DashboardShellProps {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

const DashboardShell: React.FC<DashboardShellProps> = ({ header, sidebar, children }) => {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground transition-colors duration-300">
      {header}
      <div className="relative flex flex-1">
        {sidebar}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

export default DashboardShell;
