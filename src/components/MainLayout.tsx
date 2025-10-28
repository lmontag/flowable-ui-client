import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function MainLayout({ children, rightPanel }: { children: React.ReactNode, rightPanel?: React.ReactNode }) {
  return (
    <div className="min-h-screen font-sans bg-[#f6f7fa]">
      {/* Fixed Topbar */}
      <div className="fixed top-0 left-0 right-0 z-30" style={{height: 56}}>
        <Topbar />
      </div>
      {/* Fixed Sidebar */}
      <div className="fixed top-14 left-0 bottom-0 z-20" style={{width: 80}}>
        <Sidebar />
      </div>
      {/* Main content area with scroll */}
      <div className="flex" style={{paddingTop: 56, minHeight: '100vh'}}>
        <div style={{width: 80, flexShrink: 0}} />
        <main className="flex-1 p-8 overflow-auto flex flex-col min-h-[calc(100vh-56px)]" style={{height: 'calc(100vh - 56px)'}}>
          {children}
        </main>
        {rightPanel && (
          <aside className="bg-white border-l shadow-sm p-6 flex flex-col" style={{ minWidth: 320, width: '50vw', maxWidth: '900px' }}>
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
}