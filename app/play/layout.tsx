export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="h-screen max-h-screen overflow-hidden flex flex-col select-none"
      style={{ background: '#070B12', color: 'var(--foreground)' }}
    >
      {children}
    </div>
  );
}
