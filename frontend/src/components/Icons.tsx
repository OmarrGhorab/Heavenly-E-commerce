// components/Icons.tsx
import { cn } from "@/lib/utils"; // Assuming you have a className utility

export type IconName = 
  | 'user'
  | 'shopping-bag'
  | 'package'
  | 'cpu'
  | 'book'
  | 'check'
  | 'search'
  | 'arrow-right'
  | 'arrow-left';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  className?: string;
}

const icons: Record<IconName, string> = {
  'user': 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 8a6 6 0 1 1 12 0A6 6 0 0 1 6 8zm2 8a3 3 0 0 0-3 3 1 1 0 1 1-2 0 5 5 0 0 1 5-5h8a5 5 0 0 1 5 5 1 1 0 1 1-2 0 3 3 0 0 0-3-3H8z',
  'shopping-bag': 'M5 8h14l-1 13H6L5 8zm7-5a3 3 0 0 1 3 3v1H9V6a3 3 0 0 1 3-3z',
  'package': 'M12 1.5l8.66 5v11L12 22.5 3.34 17.5v-11L12 1.5zm0 2.312L5 8.653v7.02l7 4.167 7-4.167v-7.02L12 3.812zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z',
  'cpu': 'M6 2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v12h12V4H6zm3 8h6v2H9v-2zm8-6h2v2h-2V6zm0 4h2v2h-2v-2zm-12 0h2v2H5v-2zm0-4h2v2H5V6zm12 8h2v2h-2v-2zm-12 0h2v2H5v-2z',
  'book': 'M3 18h18v2H3v-2zm0-1h18v-2H3v2zm0-4h18V5H3v8zm2-6h14v4H5V7z',
  'check': 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z',
  'search': 'M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  'arrow-right': 'M10 17l5-5-5-5v10z',
  'arrow-left': 'M14 17l-5-5 5-5v10z'
};

export const Icon = ({
  name,
  size = 24,
  className,
  ...props
}: IconProps) => (
  <svg
    {...props}
    role="img"
    aria-label={name}
    className={cn('inline-block fill-current', className)}
    width={size}
    height={size}
    viewBox="0 0 24 24"
  >
    <path d={icons[name]} />
  </svg>
);