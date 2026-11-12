/** "Series of Zs" icon for Sleep (Task 3, C5). Lucide has no such icon, so it is drawn here. */
import type { SVGProps } from 'react';

export function ZzzIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={24} height={24} {...props}>
      <path d="M3 11h6l-6 8h6" />
      <path d="M12 5h5l-5 6h5" />
      <path d="M18 2h3l-3 4h3" />
    </svg>
  );
}
