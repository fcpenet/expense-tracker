import { useNavigate } from 'react-router-dom'

interface Props {
  title: string
  backTo?: string
  rightAction?: React.ReactNode
}

export function Header({ title, backTo, rightAction }: Props) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
      {backTo && (
        <button
          onClick={() => navigate(backTo)}
          className="p-1 -ml-1 text-gray-600 hover:text-gray-900"
          aria-label="Go back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <h1 className="flex-1 text-lg font-bold text-gray-900 truncate">{title}</h1>
      {rightAction && <div>{rightAction}</div>}
    </header>
  )
}
