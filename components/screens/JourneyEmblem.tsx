import type { JourneyId } from '@/src/domain/types';

/**
 * Emblema de cada jornada, desenhado a partir do símbolo central da história.
 * Substitui ícones genéricos e sobrevive ao tratamento de card bloqueado,
 * onde a silhueta é justamente o que a spec §3 pede.
 */
export function JourneyEmblem({ journey }: { journey: JourneyId }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={`gold-${journey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffeec0" />
          <stop offset="52%" stopColor="#f3bd59" />
          <stop offset="100%" stopColor="#a86a16" />
        </linearGradient>
      </defs>
      <g fill={`url(#gold-${journey})`} stroke="#7d4d12" strokeWidth="1.2" strokeLinejoin="round">
        {shape(journey)}
      </g>
    </svg>
  );
}

function shape(journey: JourneyId) {
  switch (journey) {
    /* Davi — a funda do pastor e a pedra do ribeiro */
    case 'davi':
      return (
        <>
          <path d="M20 8c-5 13-4 26 6 34l6-3-4-31z" />
          <path d="M44 8c5 13 4 26-6 34l-6-3 4-31z" />
          <path d="M26 42c3 6 9 6 12 0l-2-5H28z" />
          <circle cx="32" cy="42" r="7" fill="#c8ced2" stroke="#5f676c" />
        </>
      );
    /* Moisés — as tábuas da lei */
    case 'moises':
      return (
        <>
          <path d="M10 22a11 11 0 0122 0v34H10z" />
          <path d="M32 22a11 11 0 0122 0v34H32z" />
          <g stroke="#7d4d12" strokeWidth="2" strokeLinecap="round">
            <path d="M16 30h10M16 38h10M16 46h10M38 30h10M38 38h10M38 46h10" />
          </g>
        </>
      );
    /* Josué — a trombeta diante das muralhas */
    case 'josue':
      return (
        <>
          <path d="M8 30l32-12 16-4-4 18 4 18-16-4-32-12z" />
          <rect x="4" y="26" width="8" height="12" rx="3" />
          <path d="M52 14v36" strokeWidth="2" />
        </>
      );
    /* Abraão — a promessa das estrelas */
    case 'abraao':
      return (
        <>
          <path d="M32 6l5 12 13 2-9 9 2 13-11-6-11 6 2-13-9-9 13-2z" />
          <path d="M14 44l2.5 6 6.5 1-4.5 4.5 1 6.5L14 59l-5.5 3 1-6.5L5 51l6.5-1z" />
          <path d="M50 42l2 5 5.5 1-4 4 1 5.5-4.5-2.5-4.5 2.5 1-5.5-4-4 5.5-1z" />
        </>
      );
    /* Jacó — a escada entre a terra e o céu */
    case 'jaco':
      return (
        <>
          <path d="M18 60L28 6h5L23 60z" />
          <path d="M41 60L31 6h5l10 54z" />
          <g stroke="#7d4d12" strokeWidth="2.4" strokeLinecap="round">
            <path d="M25 48h14M26 39h12M28 30h9M29 21h7" />
          </g>
        </>
      );
    /* Jesus — o caminho, com a cruz ao fim */
    case 'jesus':
      return (
        <>
          <path d="M22 60c0-14 6-20 6-30S22 16 22 6h20c0 10-6 14-6 24s6 16 6 30z" opacity=".38" />
          <rect x="28" y="8" width="8" height="34" rx="2" />
          <rect x="16" y="18" width="32" height="8" rx="2" />
        </>
      );
  }
}
