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

export function RestoreIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.6 6.2v4.4h4.4" />
      <path d="M5.7 10.5a7 7 0 1 1 .9 5.9" />
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

export function UserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8.6" r="3.6" />
      <path d="M4.8 20.2a7.4 7.4 0 0 1 14.4 0" />
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

/* Icons added for the widget library and customization phase. */

export function TimerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="13.4" r="7.4" />
      <path d="M12 9.6v4l2.4 1.6M9.4 3.6h5.2M17.6 6.6l1.5-1.5" />
    </Icon>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.8" y="5.4" width="16.4" height="14.2" rx="2.4" />
      <path d="M3.8 9.6h16.4M8.2 3.4v3.6M15.8 3.4v3.6" />
    </Icon>
  );
}

export function MusicIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9.4 18.2V6.4l9-1.8v11.6" />
      <circle cx="6.9" cy="18.2" r="2.5" />
      <circle cx="15.9" cy="16.2" r="2.5" />
    </Icon>
  );
}

export function VolumeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.2 9.6h3.2l4-3.4v11.6l-4-3.4H4.2z" />
      <path d="M15.2 9a4.4 4.4 0 0 1 0 6M17.8 6.6a7.8 7.8 0 0 1 0 10.8" />
    </Icon>
  );
}

export function BookmarkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.4 3.8h11.2v16.4L12 16.4l-5.6 3.8z" />
    </Icon>
  );
}

export function TabsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.6" y="7.4" width="13.4" height="12" rx="2.2" />
      <path d="M7 4.6h11.2a2.2 2.2 0 0 1 2.2 2.2v9.4" />
    </Icon>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.8v10.4M7.6 10.2l4.4 4.4 4.4-4.4M4.6 19.4h14.8" />
    </Icon>
  );
}

export function BatteryIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.8" y="7.6" width="16" height="8.8" rx="2.2" />
      <path d="M21.2 10.6v2.8M6 10.6v2.8M9.4 10.6v2.8M12.8 10.6v2.8" />
    </Icon>
  );
}

export function WifiIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.4 9.4a13 13 0 0 1 17.2 0M6.6 12.8a8.6 8.6 0 0 1 10.8 0M9.8 16.2a4.2 4.2 0 0 1 4.4 0" />
      <circle cx="12" cy="19.4" r="1.1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 3.8h6l-.8 5.2 3.2 3v1.6h-5v6.6l-.4 1.4-.4-1.4v-6.6h-5v-1.6l3.2-3z" />
    </Icon>
  );
}

export function LayoutIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.6" y="4.2" width="16.8" height="15.6" rx="2.2" />
      <path d="M3.6 9.4h16.8M9.6 9.4v10.4" />
    </Icon>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="10.4" width="14" height="9.6" rx="2.2" />
      <path d="M8.2 10.4V8a3.8 3.8 0 0 1 7.6 0v2.4" />
    </Icon>
  );
}

export function UnlockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="10.4" width="14" height="9.6" rx="2.2" />
      <path d="M8.2 10.4V8a3.8 3.8 0 0 1 7.4-1" />
    </Icon>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.8 12s3.3-6 9.2-6 9.2 6 9.2 6-3.3 6-9.2 6-9.2-6-9.2-6z" />
      <circle cx="12" cy="12" r="2.6" />
    </Icon>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 4l16 16M9.8 6.3A9.6 9.6 0 0 1 12 6c5.9 0 9.2 6 9.2 6a17 17 0 0 1-3 3.6M6.2 7.9A17.4 17.4 0 0 0 2.8 12s3.3 6 9.2 6a9.8 9.8 0 0 0 4-1" />
    </Icon>
  );
}

export function GripIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1.1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14.6 5.4L8 12l6.6 6.6" />
    </Icon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9.4 5.4L16 12l-6.6 6.6" />
    </Icon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.4" y="5.6" width="17.2" height="12.8" rx="2.4" />
      <path d="M4.4 7l7.6 5.8L19.6 7" />
    </Icon>
  );
}

export function ContactsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9.4" cy="9" r="3.2" />
      <path d="M3.6 19.4a5.8 5.8 0 0 1 11.6 0M17.2 6.4a3 3 0 0 1 0 5.6M18.4 15.2a5.4 5.4 0 0 1 3 4.2" />
    </Icon>
  );
}

export function ImageIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.4" y="4.4" width="17.2" height="15.2" rx="2.4" />
      <circle cx="8.6" cy="9.4" r="1.6" />
      <path d="M4.4 17.4l4.6-4.4 3.4 3.2 3-2.6 4.2 4" />
    </Icon>
  );
}

export function KeyboardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.6" y="6.4" width="18.8" height="11.2" rx="2.4" />
      <path d="M6.4 10h.1M9.6 10h.1M12.8 10h.1M16 10h.1M7.4 13.8h9.2" />
    </Icon>
  );
}

export function AccessibilityIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="4.6" r="1.9" />
      <path d="M4.8 8.4c4.8 1.4 9.6 1.4 14.4 0M12 8.6v6M12 14.6l-3 6M12 14.6l3 6" />
    </Icon>
  );
}

export function MicIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="9" y="3.4" width="6" height="11" rx="3" />
      <path d="M5.8 11.4a6.2 6.2 0 0 0 12.4 0M12 17.6v3M8.8 20.6h6.4" />
    </Icon>
  );
}

export function CalculatorIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4.6" y="3.4" width="14.8" height="17.2" rx="2.4" />
      <path d="M8 7.4h8M8.4 11.6h.1M12 11.6h.1M15.6 11.6h.1M8.4 15.4h.1M12 15.4h.1M15.6 15.4h.1M8.4 18.4h.1M12 18.4h.1M15.6 18.4h.1" />
    </Icon>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.4c3.4 3.4 5.4 5.9 5.4 9a5.4 5.4 0 1 1-10.8 0c0-1.6.6-2.8 1.5-3.8.3 1.3 1 2 2 2.4.6-3 1-5.2 1.9-7.6z" />
    </Icon>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.4 19.6V4.6M4.4 19.6h15.2M8.4 16V12M12.4 16V7.6M16.4 16v-5.4" />
    </Icon>
  );
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.2" y="7.6" width="17.6" height="11.8" rx="2.2" />
      <path d="M9 7.6V5.8a1.8 1.8 0 0 1 1.8-1.8h2.4A1.8 1.8 0 0 1 15 5.8v1.8M3.2 12.4h17.6" />
    </Icon>
  );
}

export function GraduationIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.8 9.2L12 4.6l9.2 4.6L12 13.8z" />
      <path d="M6.4 11.2v4.4c0 1.6 2.5 3 5.6 3s5.6-1.4 5.6-3v-4.4M21.2 9.2v5.2" />
    </Icon>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.4 10.6L12 4.2l7.6 6.4V20H4.4z" />
      <path d="M9.6 20v-5.4h4.8V20" />
    </Icon>
  );
}

export function FilmIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5.4" width="18" height="13.2" rx="2.2" />
      <path d="M8 5.4v13.2M16 5.4v13.2M3 12h18M3 8.4h5M3 15.6h5M16 8.4h5M16 15.6h5" />
    </Icon>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 11v5.4M12 7.8h.1" />
    </Icon>
  );
}

export function LinkIcon2(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10.2 13.8a3.6 3.6 0 0 0 5.1 0l3-3a3.6 3.6 0 0 0-5.1-5.1L11.8 7" />
      <path d="M13.8 10.2a3.6 3.6 0 0 0-5.1 0l-3 3a3.6 3.6 0 0 0 5.1 5.1L12.2 17" />
    </Icon>
  );
}
