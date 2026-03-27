interface StageBadgeProps {
  name: string
  color: string
  size?: 'sm' | 'md'
}

export default function StageBadge({ name, color, size = 'md' }: StageBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded font-medium whitespace-nowrap tracking-wide ${
        size === 'sm' ? 'px-1.5 py-px text-[11px]' : 'px-2 py-0.5 text-[11px]'
      }`}
      style={{ backgroundColor: color + '18', color: color }}
    >
      {name}
    </span>
  )
}
