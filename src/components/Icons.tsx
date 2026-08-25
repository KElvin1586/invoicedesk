type IconProps = { className?: string };

function Base({ children, className = 'h-5 w-5' }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return <Base className={className}><path d="M3 10.5 12 3l9 7.5" /><path d="M5.9 21h12.2a1 1 0 0 0 1-1v-8" /><path d="M9 21v-6h6v6" /></Base>;
}

export function LedgerIcon({ className }: IconProps) {
  return <Base className={className}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 12h8M8 8h4M8 16h6" /></Base>;
}

export function TargetIcon({ className }: IconProps) {
  return <Base className={className}><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="3.5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></Base>;
}

export function RepeatIcon({ className }: IconProps) {
  return <Base className={className}><path d="M4 9v-2a2 2 0 0 1 2-2h12l-2 2" /><path d="M20 15v2a2 2 0 0 1-2 2H6l2-2" /></Base>;
}

export function TagIcon({ className }: IconProps) {
  return <Base className={className}><path d="M20 12L12 4H4v8l8 8z" /><circle cx="9" cy="9" r="1.5" fill="currentColor" /></Base>;
}

export function ChartIcon({ className }: IconProps) {
  return <Base className={className}><path d="M4 20V10M9 20V4M14 20v-9M19 20v-13" /></Base>;
}

export function GearIcon({ className }: IconProps) {
  return <Base className={className}><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.8-3.2l1-1.3-2-2-1.3 1a7 7 0 0 0-3.2-.8L12 3l-.3 1.7a7 7 0 0 0-3.2.8l-1.3-1-2 2 1 1.3a7 7 0 0 0-.8 3.2L3 12l1.7.3a7 7 0 0 0 .8 3.2l-1 1.3 2 2 1.3-1a7 7 0 0 0 3.2.8l.3 1.7 .3-1.7a7 7 0 0 0 3.2-.8l1.3 1 2-2-1-1.3a7 7 0 0 0 .8-3.2z" /></Base>;
}

export function PlusIcon({ className }: IconProps) {
  return <Base className={className}><path d="M12 5v14M5 12h14" /></Base>;
}

export function SearchIcon({ className }: IconProps) {
  return <Base className={className}><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></Base>;
}

export function PencilIcon({ className }: IconProps) {
  return <Base className={className}><path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 0A2 2 0 0 1 19 6L8 19l-4 1z" /></Base>;
}

export function TrashIcon({ className }: IconProps) {
  return <Base className={className}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /><path d="M10 11v6M14 11v6" /></Base>;
}

export function DownloadIcon({ className }: IconProps) {
  return <Base className={className}><path d="M12 4v11m0 0-4-4m4 4 4-4" /><path d="M4 19h16" /></Base>;
}

export function UploadIcon({ className }: IconProps) {
  return <Base className={className}><path d="M12 19V8m0 0-4 4m4-4 4 4" /><path d="M4 5h16" /></Base>;
}
