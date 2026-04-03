export const PulseWatchLogo = ({ compact = false }: { compact?: boolean }) => (
  <div className={`pulsewatch-logo ${compact ? "pulsewatch-logo-compact" : ""}`}>
    <svg viewBox="0 0 96 96" aria-hidden="true" className="pulsewatch-logo-mark">
      <defs>
        <linearGradient id="pulsewatch-gradient" x1="12" y1="10" x2="84" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4cc9f0" />
          <stop offset="52%" stopColor="#ff5fa2" />
          <stop offset="100%" stopColor="#ffb703" />
        </linearGradient>
      </defs>
      <circle cx="48" cy="48" r="34" fill="none" stroke="url(#pulsewatch-gradient)" strokeWidth="8" />
      <path
        d="M18 52h12l6-14 10 25 8-18h24"
        fill="none"
        stroke="#fbfdff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="69" cy="27" r="6" fill="#ffb703" />
      <path d="M69 21v-7" stroke="#fbfdff" strokeWidth="4" strokeLinecap="round" />
      <path d="M69 27l6 4" stroke="#fbfdff" strokeWidth="4" strokeLinecap="round" />
    </svg>
  </div>
);
