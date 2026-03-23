interface StageBadgeProps {
  name: string
  color: string
  size?: 'sm' | 'md'
}

export default function StageBadge({ name, color, size = 'md' }: StageBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium whitespace-nowrap ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
      style={{ backgroundColor: color + '20', color: color, border: `1px solid ${color}40` }}
    >
      {name}
    </span>
  )
}
