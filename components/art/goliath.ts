/**
 * Golias, desenhado uma única vez.
 *
 * O mesmo SVG alimenta o confronto em DOM e a textura da cena em AR, então a
 * silhueta do gigante é sempre a mesma. Se um PNG de pixel art existir em
 * `public/assets/characters/goliath.png`, ele tem prioridade nos dois lugares.
 */

const BRONZE_LIGHT = '#c99b52';
const BRONZE = '#8d6a34';
const BRONZE_DARK = '#4f3a1b';
const STEEL = '#8d979e';
const STEEL_DARK = '#4d565c';
const CLOTH = '#6b2b22';
const PLUME = '#b8332a';
const SKIN = '#a97b52';
const SKIN_DARK = '#6f4c2e';

export const GOLIATH_VIEWBOX = '0 0 72 132';

/** Corpo do SVG, sem o elemento raiz — reaproveitado por React e pela textura. */
export const GOLIATH_BODY = `
<g stroke="${BRONZE_DARK}" stroke-width="1" stroke-linejoin="round">
  <!-- lança, atravessando toda a figura -->
  <rect x="58" y="4" width="4" height="126" fill="#5b3d1d"/>
  <path d="M60 0l7 14-7 6-7-6z" fill="${STEEL}" stroke="${STEEL_DARK}"/>
  <!-- escudo ao lado esquerdo -->
  <ellipse cx="13" cy="72" rx="12" ry="18" fill="${BRONZE}"/>
  <ellipse cx="13" cy="72" rx="7" ry="12" fill="${BRONZE_LIGHT}" opacity=".55"/>
  <circle cx="13" cy="72" r="3" fill="${BRONZE_DARK}"/>
  <!-- pernas e grevas -->
  <rect x="24" y="98" width="10" height="30" fill="${SKIN_DARK}"/>
  <rect x="40" y="98" width="10" height="30" fill="${SKIN_DARK}"/>
  <rect x="23" y="104" width="12" height="14" rx="2" fill="${BRONZE}"/>
  <rect x="39" y="104" width="12" height="14" rx="2" fill="${BRONZE}"/>
  <rect x="21" y="126" width="15" height="6" rx="2" fill="${BRONZE_DARK}"/>
  <rect x="38" y="126" width="15" height="6" rx="2" fill="${BRONZE_DARK}"/>
  <!-- túnica -->
  <path d="M22 84h30l-3 18H25z" fill="${CLOTH}"/>
  <!-- couraça de escamas -->
  <path d="M20 40h34l3 46H17z" fill="${BRONZE}"/>
  <g fill="${BRONZE_DARK}" opacity=".5" stroke="none">
    <circle cx="25" cy="50" r="2.6"/><circle cx="33" cy="50" r="2.6"/><circle cx="41" cy="50" r="2.6"/><circle cx="49" cy="50" r="2.6"/>
    <circle cx="29" cy="59" r="2.6"/><circle cx="37" cy="59" r="2.6"/><circle cx="45" cy="59" r="2.6"/>
    <circle cx="25" cy="68" r="2.6"/><circle cx="33" cy="68" r="2.6"/><circle cx="41" cy="68" r="2.6"/><circle cx="49" cy="68" r="2.6"/>
    <circle cx="29" cy="77" r="2.6"/><circle cx="37" cy="77" r="2.6"/><circle cx="45" cy="77" r="2.6"/>
  </g>
  <!-- ombreiras -->
  <path d="M14 40h14v12H12z" fill="${BRONZE_LIGHT}"/>
  <path d="M46 40h14l2 12H46z" fill="${BRONZE_LIGHT}"/>
  <!-- braços -->
  <rect x="10" y="50" width="9" height="26" rx="4" fill="${SKIN}"/>
  <rect x="55" y="50" width="9" height="26" rx="4" fill="${SKIN}"/>
  <!-- cabeça e elmo -->
  <rect x="28" y="30" width="17" height="12" fill="${SKIN}"/>
  <path d="M25 30a12 12 0 0124 0v6H25z" fill="${BRONZE}"/>
  <path d="M25 30a12 12 0 0112-12v18H25z" fill="${BRONZE_LIGHT}" opacity=".45"/>
  <rect x="35" y="20" width="4" height="20" fill="${BRONZE_DARK}"/>
  <path d="M31 22c8-10 14-4 10 8-3-6-6-7-10-8z" fill="${PLUME}" stroke="none"/>
  <!-- a testa descoberta: o único ponto sem bronze -->
  <rect x="32" y="33" width="9" height="4" rx="1" fill="${SKIN_DARK}" stroke="none" opacity=".55"/>
</g>
`;

export const GOLIATH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${GOLIATH_VIEWBOX}" width="288" height="528">${GOLIATH_BODY}</svg>`;

/** Data URI da mesma arte, para virar textura no Three.js. */
export function goliathDataUri(): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(GOLIATH_SVG)}`;
}
