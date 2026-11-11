/**
 * Illustrated stand-ins for the built-in sample food photos. They are simple
 * drawings (not real photos) and each one carries descriptive alt text (AR6).
 */
export function FoodPhoto({ id, alt, className }: { id: string; alt: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 90" role="img" aria-label={alt} className={className}>
      <rect width="120" height="90" rx="10" fill="#2a2525" />
      {id === 'salmon' && (
        <g>
          <ellipse cx="60" cy="47" rx="46" ry="33" fill="#e9e5e2" />
          <ellipse cx="60" cy="47" rx="38" ry="26" fill="#f6f3f1" />
          <path d="M34 42c8-12 30-14 40-2-8 10-30 12-40 2z" fill="#f08a62" />
          <path d="M42 40l4 4m4-6l4 5m4-6l3 5" stroke="#f6c2ab" strokeWidth="2" />
          <ellipse cx="72" cy="58" rx="13" ry="7" fill="#ffffff" stroke="#d9d4d0" />
          <circle cx="48" cy="60" r="5" fill="#3f8f46" />
          <circle cx="54" cy="63" r="4.5" fill="#2f7a37" />
          <circle cx="43" cy="64" r="4" fill="#4aa352" />
        </g>
      )}
      {id === 'oatmeal' && (
        <g>
          <ellipse cx="60" cy="40" rx="40" ry="14" fill="#c9a77a" />
          <path d="M20 40c2 26 78 26 80 0" fill="#e6e1dc" />
          <ellipse cx="60" cy="40" rx="34" ry="10" fill="#e8d3a9" />
          <circle cx="50" cy="38" r="3.5" fill="#3b4ba8" />
          <circle cx="58" cy="41" r="3.5" fill="#3b4ba8" />
          <circle cx="66" cy="37" r="3.5" fill="#c2304b" />
          <circle cx="72" cy="41" r="3.5" fill="#c2304b" />
          <circle cx="44" cy="42" r="3" fill="#3b4ba8" />
        </g>
      )}
      {id === 'blurry' && (
        <g>
          <defs>
            <filter id="blur-food">
              <feGaussianBlur stdDeviation="9" />
            </filter>
          </defs>
          <g filter="url(#blur-food)">
            <ellipse cx="50" cy="45" rx="30" ry="22" fill="#8d7a6a" />
            <ellipse cx="78" cy="50" rx="22" ry="16" fill="#5d6c55" />
          </g>
        </g>
      )}
    </svg>
  );
}
