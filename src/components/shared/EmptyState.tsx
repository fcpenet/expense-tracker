interface Props {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function EmptyState({ title, subtitle, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4">💸</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
      {action}
    </div>
  )
}
