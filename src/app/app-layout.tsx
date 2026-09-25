import React from 'react'

export function AppLayout({
  header,
  sidebar,
  children,
}: {
  header: React.ReactNode
  sidebar: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground font-sans antialiased">
      {header}
      <main className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        <aside className="w-full md:w-[420px] lg:w-[450px] shrink-0 h-1/2 md:h-full flex flex-col overflow-hidden">
          {sidebar}
        </aside>
        <section className="flex-1 h-1/2 md:h-full relative overflow-hidden bg-slate-950">
          {children}
        </section>
      </main>
    </div>
  )
}
