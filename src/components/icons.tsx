import type { ReactNode, SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

/** Shared stroke setup; every icon inherits the current text colour. */
function Icon({ size = 18, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M19.1 14.6a1.6 1.6 0 0 0 .33 1.77l.06.06a1.9 1.9 0 1 1-2.69 2.69l-.06-.06a1.6 1.6 0 0 0-1.77-.33 1.6 1.6 0 0 0-.97 1.47V21a1.9 1.9 0 1 1-3.8 0v-.1a1.6 1.6 0 0 0-1.04-1.47 1.6 1.6 0 0 0-1.77.33l-.06.06a1.9 1.9 0 1 1-2.69-2.69l.06-.06a1.6 1.6 0 0 0 .33-1.77 1.6 1.6 0 0 0-1.47-.97H3a1.9 1.9 0 1 1 0-3.8h.1A1.6 1.6 0 0 0 4.57 9a1.6 1.6 0 0 0-.33-1.77l-.06-.06a1.9 1.9 0 1 1 2.69-2.69l.06.06A1.6 1.6 0 0 0 8.7 4.87h.08A1.6 1.6 0 0 0 9.75 3.4V3a1.9 1.9 0 1 1 3.8 0v.1a1.6 1.6 0 0 0 .97 1.47 1.6 1.6 0 0 0 1.77-.33l.06-.06a1.9 1.9 0 1 1 2.69 2.69l-.06.06A1.6 1.6 0 0 0 18.65 9v.08a1.6 1.6 0 0 0 1.47.97H21a1.9 1.9 0 1 1 0 3.8h-.1a1.6 1.6 0 0 0-1.8 .75z" />
    </Icon>
  );
}

export function DotsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="5.6" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18.4" r="1.35" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20h4.2L20 8.2a2.1 2.1 0 0 0 0-3L19 4.2a2.1 2.1 0 0 0-3 0L4.2 15.8V20z" />
      <path d="M14.5 6.5l3 3" />
    </Icon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M9.5 7V5.4A1.4 1.4 0 0 1 10.9 4h2.2a1.4 1.4 0 0 1 1.4 1.4V7" />
      <path d="M6.5 7l.8 11.1A1.9 1.9 0 0 0 9.2 20h5.6a1.9 1.9 0 0 0 1.9-1.9L17.5 7" />
      <path d="M10.5 11v5M13.5 11v5" />
    </Icon>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 19V5M6.5 10.5L12 5l5.5 5.5" />
    </Icon>
  );
}

export function ArrowDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M6.5 13.5L12 19l5.5-5.5" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.2" />
      <path d="M15.6 15.6L20 20" />
    </Icon>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l2.6-2.6a3.5 3.5 0 0 0-5-5l-1.3 1.3" />
      <path d="M13.5 10.5a3.5 3.5 0 0 0-5 0L5.9 13a3.5 3.5 0 0 0 5 5l1.3-1.3" />
    </Icon>
  );
}

export function NoteIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 3.8h9.6L19 7.2V20a1.2 1.2 0 0 1-1.2 1.2H6A1.2 1.2 0 0 1 4.8 20V5a1.2 1.2 0 0 1 1.2-1.2z" />
      <path d="M15.2 4v3.6H19M8 11h8M8 14.6h8M8 18h5" />
    </Icon>
  );
}

export function TaskIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 7.5H10M20 12H10M20 16.5H10" />
      <path d="M4.4 7.4l1.5 1.6 2.4-2.6M4.4 12.2l1.5 1.6 2.4-2.6M4.4 17l1.5 1.6 2.4-2.6" />
    </Icon>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Icon>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 14.4A8.2 8.2 0 0 1 9.6 4 8.4 8.4 0 1 0 20 14.4z" />
    </Icon>
  );
}

export function MonitorIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.2" y="4.6" width="17.6" height="12" rx="1.8" />
      <path d="M9 20h6M12 16.6V20" />
    </Icon>
  );
}

export function ResetIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 5.8v4.4h4.4" />
      <path d="M5.6 10.2a7.2 7.2 0 1 1 .9 6.1" />
    </Icon>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="4" width="6.6" height="6.6" rx="1.4" />
      <rect x="13.4" y="4" width="6.6" height="6.6" rx="1.4" />
      <rect x="4" y="13.4" width="6.6" height="6.6" rx="1.4" />
      <rect x="13.4" y="13.4" width="6.6" height="6.6" rx="1.4" />
    </Icon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.4V12l3.2 2" />
    </Icon>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.6l1.9 4.9 4.9 1.9-4.9 1.9-1.9 4.9-1.9-4.9L5.2 10.4l4.9-1.9z" />
      <path d="M18 16.4l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
    </Icon>
  );
}

export function CloudIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7.2 18.4h9.6a3.6 3.6 0 0 0 .4-7.2 5.2 5.2 0 0 0-10-1.6 4.4 4.4 0 0 0 0 8.8z" />
    </Icon>
  );
}

export function PlugIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 3.6v4.2M15 3.6v4.2" />
      <path d="M6.6 7.8h10.8v2.4a5.4 5.4 0 0 1-5.4 5.4 5.4 5.4 0 0 1-5.4-5.4z" />
      <path d="M12 15.6V20.4" />
    </Icon>
  );
}

export function LayersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.6l8.2 4.2-8.2 4.2-8.2-4.2z" />
      <path d="M4 12.4l8 4.1 8-4.1M4 16.4l8 4.1 8-4.1" />
    </Icon>
  );
}

export function PaletteIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 20.4a8.4 8.4 0 1 1 8.4-8.4c0 2.3-1.9 3.1-3.4 3.1h-1.6a1.9 1.9 0 0 0-1.3 3.3 1.7 1.7 0 0 1-1.2 2z" />
      <circle cx="8.4" cy="10.6" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="12" cy="8" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="15.6" cy="10.2" r="1.05" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.6l7 2.6v5.6c0 4-2.9 7-7 8.6-4.1-1.6-7-4.6-7-8.6V6.2z" />
      <path d="M9.2 12.1l2 2 3.6-3.9" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.8 12.6l4.4 4.4L19.2 7" />
    </Icon>
  );
}
