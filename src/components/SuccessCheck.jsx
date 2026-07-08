// Shared success moment — checkmark draw-on + pop. One vector used by app
// actions (buyer apartar) AND the portfolio story, so the moment is identical
// everywhere (portfolio-framework-spec §"Key architectural moves" #3).
// Keyframes live in src/styles/motion.css (.case-pop / .case-check-path).
export function SuccessCheck({ size = 44, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      className={`case-pop ${className}`.trim()}
      role="img"
      aria-label="ok"
    >
      <circle cx="22" cy="22" r="20" fill="var(--success)" />
      <path
        d="M13 22.5 L19.5 29 L31 16.5"
        fill="none"
        stroke="var(--success-foreground)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="case-check-path"
      />
    </svg>
  )
}
