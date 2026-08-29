import type { JourneyId } from '@/src/domain/types';

/**
 * Emblema de cada jornada, desenhado a partir do símbolo central da história.
 *
 * As formas são deliberadamente cheias e simples: o card bloqueado dessatura o
 * emblema, e uma silhueta sólida continua reconhecível onde um contorno fino
 * desapareceria.
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
      <g fill={`url(#gold-${journey})`} stroke="#6b3f0d" strokeWidth="1.6" strokeLinejoin="round">
        {shape(journey)}
      </g>
    </svg>
  );
}

function shape(journey: JourneyId) {
  switch (journey) {
    /* Davi — a funda com a pedra do ribeiro, como na ref/10.png */
    case 'davi':
      return (
        <>
          <path d="M14 6l7 3-4 20-6-2z" />
          <path d="M50 6l-7 3 4 20 6-2z" />
          <path d="M17 29l6 2-1 9-7-3z" />
          <path d="M47 29l-6 2 1 9 7-3z" />
          <path d="M20 39c0 9 6 15 12 15s12-6 12-15l-6 2H26z" />
          <circle cx="32" cy="45" r="8" fill="#cdd3d7" stroke="#5a6268" />
          <circle cx="29" cy="42" r="2.6" fill="#eef1f3" stroke="none" opacity=".85" />
        </>
      );
    /* Moisés — as tábuas da lei */
    case 'moises':
      return (
        <>
          <path d="M8 24a12 12 0 0124 0v34H8z" />
          <path d="M32 24a12 12 0 0124 0v34H32z" />
          <g stroke="#6b3f0d" strokeWidth="2.6" strokeLinecap="round">
            <path d="M14 32h12M14 40h12M14 48h12M38 32h12M38 40h12M38 48h12" />
          </g>
        </>
      );
    /* Josué — a trombeta diante das muralhas */
    case 'josue':
      return (
        <>
          <path d="M6 32l30-14 20-6-5 20 5 20-20-6z" />
          <rect x="2" y="26" width="9" height="12" rx="3" />
          <path d="M56 8v48" stroke="#6b3f0d" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    /* Abraão — a promessa das estrelas */
    case 'abraao':
      return (
        <>
          <path d="M30 4l6 14 15 2-11 10 3 15-13-7-13 7 3-15-11-10 15-2z" />
          <path d="M50 40l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
          <path d="M12 44l2.5 6 6 1-4.5 4 1 6-5-3-5 3 1-6-4.5-4 6-1z" />
        </>
      );
    /* Jacó — a escada entre a terra e o céu */
    case 'jaco':
      return (
        <>
          <path d="M14 60L26 4h7L21 60z" />
          <path d="M43 60L31 4h7l12 56z" />
          <g stroke="#6b3f0d" strokeWidth="3.4" strokeLinecap="round">
            <path d="M23 48h18M25 37h14M27 26h11M29 15h7" />
          </g>
        </>
      );
    /* Jesus — o caminho que se estreita até a cruz */
    case 'jesus':
      return (
        <>
          <path d="M18 62l8-30h12l8 30z" opacity=".42" />
          <rect x="27" y="4" width="10" height="34" rx="2" />
          <rect x="14" y="15" width="36" height="10" rx="2" />
        </>
      );
  }
}
