import type { SVGProps } from 'react';
import type { IconName } from '../types/streakbyte';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

export function Icon({ name, className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`flex-none ${className}`}
      {...props}
    >
      {name === 'home' && <path d="M3 11 12 3l9 8M5 10v10h5v-6h4v6h5V10" />}
      {name === 'book' && (
        <>
          <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
          <path d="M4 21V5M9 7h6" />
        </>
      )}
      {name === 'target' && (
        <>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" />
        </>
      )}
      {name === 'medal' && (
        <>
          <circle cx="12" cy="15" r="5" />
          <path d="m9 11-3-8h5l1 4M15 11l3-8h-5l-1 4" />
        </>
      )}
      {name === 'trophy' && (
        <path d="M8 4h8v6a4 4 0 0 1-8 0zM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 14v4M8 21h8M10 18h4" />
      )}
      {name === 'bolt' && <path d="M13 2 4 14h7l-1 8 9-12h-7z" />}
      {name === 'flame' && (
        <path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-3 2-4 5-4 7-1-1-2-2-2-4-2 2-4 5-4 7a7 7 0 0 0 7 7z" />
      )}
      {name === 'check' && <path d="m5 12 5 5 9-10" />}
      {name === 'play' && <path d="M7 4v16l13-8z" />}
      {name === 'cpu' && (
        <>
          <rect x="6" y="6" width="12" height="12" rx="2" />
          <rect x="9.5" y="9.5" width="5" height="5" />
          <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
        </>
      )}
      {name === 'net' && (
        <>
          <rect x="9" y="3" width="6" height="5" rx="1" />
          <rect x="3" y="16" width="6" height="5" rx="1" />
          <rect x="15" y="16" width="6" height="5" rx="1" />
          <path d="M12 8v4M6 16v-4h12v4" />
        </>
      )}
      {name === 'term' && (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="m7 9 3 3-3 3M13 15h4" />
        </>
      )}
      {name === 'bell' && <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4" />}
      {name === 'lock' && (
        <>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </>
      )}
      {name === 'x' && <path d="M6 6l12 12M18 6 6 18" />}
      {name === 'send' && <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />}
      {name === 'wrench' && (
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.1L3 17.7 6.3 21l6.3-6.3a4 4 0 0 0 5.1-5.4l-2.6 2.6-2.4-.6-.6-2.4z" />
      )}
      {name === 'clock' && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      )}
      {name === 'bulb' && (
        <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z" />
      )}
      {name === 'back' && <path d="m15 5-7 7 7 7" />}
      {name === 'warn' && <path d="M12 3 2 20h20zM12 10v5M12 18v.5" />}
      {name === 'search' && (
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </>
      )}
      {name === 'sun' && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </>
      )}
      {name === 'moon' && <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />}
    </svg>
  );
}
