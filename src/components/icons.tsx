import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(size: number, props: IconProps) {
  return {
    width: props.width ?? size,
    height: props.height ?? size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: props.strokeWidth ?? 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

export function IconDash({ size = 17, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} {...p}>
      <rect x="3.5" y="3.5" width="7.4" height="7.4" rx="1.8" />
      <rect x="13.1" y="3.5" width="7.4" height="7.4" rx="1.8" />
      <rect x="3.5" y="13.1" width="7.4" height="7.4" rx="1.8" />
      <rect x="13.1" y="13.1" width="7.4" height="7.4" rx="1.8" />
    </svg>
  );
}

export function IconCalendar({ size = 17, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} {...p}>
      <rect x="3" y="4.5" width="18" height="17" rx="2.5" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
    </svg>
  );
}

export function IconBill({ size = 17, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} {...p}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  );
}

export function IconClient({ size = 17, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} {...p}>
      <circle cx="9" cy="8" r="3.4" />
      <path d="M2.8 20c.9-3.2 3.4-4.8 6.2-4.8s5.3 1.6 6.2 4.8" />
      <circle cx="17.5" cy="9" r="2.4" />
      <path d="M16.6 15.2c2.6.3 4.4 1.8 5.1 4" />
    </svg>
  );
}

export function IconBell({ size = 17, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} {...p}>
      <path d="M18 9.5a6 6 0 10-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5" />
      <path d="M10 19.5a2.2 2.2 0 003.9 0" />
    </svg>
  );
}

export function IconSearch({ size = 15, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} strokeWidth={p.strokeWidth ?? 2} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.6-3.6" />
    </svg>
  );
}

export function IconPlus({ size = 15, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} strokeWidth={p.strokeWidth ?? 2.2} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconBack({ size = 16, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} strokeWidth={p.strokeWidth ?? 2} {...p}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function IconWarn({ size = 17, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} strokeWidth={p.strokeWidth ?? 2} {...p}>
      <path d="M12 3l10 18H2L12 3z" />
      <path d="M12 10v4M12 17.2v.1" />
    </svg>
  );
}

export function IconAlert({ size = 17, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} strokeWidth={p.strokeWidth ?? 2} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V13M12 16.5v.1" />
    </svg>
  );
}

export function IconInfo({ size = 17, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} strokeWidth={p.strokeWidth ?? 2} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.8v.1" />
    </svg>
  );
}

export function IconCheck({ size = 12, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} strokeWidth={p.strokeWidth ?? 3} {...p}>
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

export function IconEdit({ size = 14, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} strokeWidth={p.strokeWidth ?? 2} {...p}>
      <path d="M17 3l4 4L8 20l-5 1 1-5L17 3z" />
    </svg>
  );
}

export function IconTrash({ size = 14, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} strokeWidth={p.strokeWidth ?? 2} {...p}>
      <path d="M3.5 6h17M9 3.5h6M8 6l.8 14h6.4L16 6M10 10v6M14 10v6" />
    </svg>
  );
}

export function IconSettings({ size = 17, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function IconLogout({ size = 14, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} strokeWidth={p.strokeWidth ?? 2} {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

export function IconBrand({ size = 18, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} strokeWidth={p.strokeWidth ?? 2} {...p}>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <circle cx="12" cy="12.5" r="3.2" />
      <path d="M8 6l1.2-2.4h5.6L16 6" />
    </svg>
  );
}

export function IconChevronLeft({ size = 15, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} strokeWidth={p.strokeWidth ?? 2.2} {...p}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function IconChevronRight({ size = 15, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} strokeWidth={p.strokeWidth ?? 2.2} {...p}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}
