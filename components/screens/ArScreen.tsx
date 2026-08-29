'use client';

import { Goliath } from '@/components/art/GoliathArt';
import { GhostButton, GoldButton, Overline } from '@/components/frame';
import { SceneStage } from '@/components/scene/SceneStage';
import { PilgrimSprite } from './PilgrimSprite';
import type { ArMissionAdapter } from '@/src/ar/ar-mission-adapter';
import type { PilgrimAppearance } from '@/src/domain/types';
import { ChevronLeft, Scan, Smartphone } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Screens.module.css';

type ArStatus = 'checking' | 'unsupported' | 'ready' | 'scanning' | 'placed' | 'throwing' | 'done';

/** Centro da zona dourada da barra de mira, em porcentagem. */
const TARGET = 68;
const TOLERANCE = 10;

/**
 * US08 — Davi × Golias.
 *
 * O caminho principal é WebXR: a cena é ancorada numa superfície real e a pedra
 * é lançada por gesto. Onde o aparelho não suporta `immersive-ar`, o mesmo
 * confronto acontece em DOM com a mesma arte — a demo nunca fica sem clímax.
 */
export function ArScreen({
  appearance,
  onResult,
  onBack,
}: {
  appearance: PilgrimAppearance;
  onResult: (hit: boolean) => void;
  onBack: () => void;
}) {
  const [status, setStatus] = useState<ArStatus>('checking');
  const [aim, setAim] = useState(8);
  const [charging, setCharging] = useState(false);
  const [stoneFlying, setStoneFlying] = useState(false);
  const [defeated, setDefeated] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const viewportRef = useRef<HTMLDivElement>(null);
  const adapterRef = useRef<ArMissionAdapter | null>(null);
  const directionRef = useRef(1);

  /* Gate de AR: o CTA só aparece depois de confirmar o suporte real. */
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { WebXrMissionAdapter } = await import('@/src/ar/webxr-mission-adapter');
        const supported = await new WebXrMissionAdapter().isSupported();
        if (!cancelled) setStatus(supported ? 'ready' : 'unsupported');
      } catch {
        if (!cancelled) setStatus('unsupported');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      adapterRef.current?.dispose();
      adapterRef.current = null;
    };
  }, []);

  /* Pulso da mira, usado apenas no confronto em DOM. */
  useEffect(() => {
    if (!charging) return;
    const pulse = window.setInterval(() => {
      setAim((value) => {
        const next = value + directionRef.current * 3;
        if (next >= 98) {
          directionRef.current = -1;
          return 98;
        }
        if (next <= 2) {
          directionRef.current = 1;
          return 2;
        }
        return next;
      });
    }, 30);
    return () => window.clearInterval(pulse);
  }, [charging]);

  const startAr = useCallback(async () => {
    if (!viewportRef.current) return;
    setStatus('scanning');
    setMessage('Aponte a câmera para o chão e mova o aparelho devagar até o marcador aparecer.');
    try {
      const { WebXrMissionAdapter } = await import('@/src/ar/webxr-mission-adapter');
      const adapter = new WebXrMissionAdapter();
      adapterRef.current = adapter;
      await adapter.start(viewportRef.current);
    } catch {
      adapterRef.current = null;
      setStatus('unsupported');
      setMessage('Não foi possível abrir a sessão de AR. O confronto continua aqui na tela.');
    }
  }, []);

  function placeAr() {
    adapterRef.current?.placeScene();
    setStatus('placed');
    setMessage('Cena posicionada. Agora mire e lance a pedra.');
  }

  async function throwAr() {
    if (!adapterRef.current) return;
    setStatus('throwing');
    const result = await adapterRef.current.throwStone();
    setStatus('done');
    setDefeated(result === 'hit');
    onResult(result === 'hit');
  }

  function releaseStone() {
    if (!charging) {
      setCharging(true);
      setMessage('Segure e solte quando o pulso cruzar a faixa dourada.');
      return;
    }
    setCharging(false);
    setStoneFlying(true);
    const distance = Math.abs(aim - TARGET);
    const hit = distance <= TOLERANCE;

    window.setTimeout(() => {
      setStoneFlying(false);
      setDefeated(hit);
      setStatus('done');
      setMessage(
        hit
          ? 'A pedra encontrou a testa descoberta — o único ponto que o bronze não cobria.'
          : 'A pedra passou longe. Respire, acompanhe o ritmo e solte dentro da faixa.',
      );
      if (hit) onResult(true);
    }, 620);
  }

  const inXr = status === 'scanning' || status === 'placed' || status === 'throwing';
  const domDuel = status === 'unsupported' || status === 'ready' || (status === 'done' && !inXr);

  return (
    <section className={styles.screen}>
      <header className={styles.screenHeader}>
        <button type="button" className={styles.backButton} onClick={onBack} aria-label="Voltar">
          <ChevronLeft aria-hidden="true" />
        </button>
        <div className={styles.screenHeaderText}>
          <Overline>A Provação · Etapa 3 de 4</Overline>
          <h1>O vale de Elá</h1>
          <p className={styles.screenIntro}>
            Golias avança pela quadragésima vez. Davi desce com um cajado, uma funda e cinco pedras.
          </p>
        </div>
      </header>

      <div className={styles.arStage}>
        <SceneStage variant="valley" label="Davi diante de Golias no vale de Elá">
          {domDuel ? (
            <div className={styles.duel}>
              <PilgrimSprite appearance={appearance} className={styles.david} alt="Davi" />
              <Goliath className={`${styles.goliath} ${defeated ? styles.goliathHit : ''}`} />
              {stoneFlying ? <span className={`${styles.stone} ${styles.stoneFlying}`} /> : null}

              {status !== 'done' ? (
                <>
                  <div className={styles.aimTrack} aria-hidden="true">
                    <span className={styles.aimZone} />
                    <span className={styles.aimMarker} style={{ left: `${aim}%` }} />
                  </div>
                  <div className={styles.arOverlay}>
                    <button
                      type="button"
                      className={`${styles.throwButton} ${charging ? styles.throwCharging : ''}`}
                      onClick={releaseStone}
                      aria-label={charging ? 'Soltar a pedra' : 'Preparar o lançamento'}
                    >
                      {charging ? 'Soltar' : 'Preparar'}
                      <small>{charging ? 'na faixa dourada' : 'toque para mirar'}</small>
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          <div ref={viewportRef} className={styles.arViewport} />
        </SceneStage>
      </div>

      <div className={styles.arStatusRow}>
        {status === 'checking' ? (
          <span className={`${styles.arBadge} ${styles.arBadgeMuted}`}>
            <Scan aria-hidden="true" />
            Verificando suporte a realidade aumentada
          </span>
        ) : null}
        {status === 'unsupported' ? (
          <span className={`${styles.arBadge} ${styles.arBadgeMuted}`}>
            <Smartphone aria-hidden="true" />
            AR indisponível neste aparelho · confronto na tela
          </span>
        ) : null}
        {status === 'ready' ? (
          <span className={styles.arBadge}>
            <Scan aria-hidden="true" />
            Este aparelho suporta realidade aumentada
          </span>
        ) : null}
      </div>

      {message ? (
        <p className={styles.feedback} aria-live="polite">
          {message}
        </p>
      ) : null}

      <div className={styles.screenActions}>
        {status === 'ready' ? <GoldButton onClick={startAr}>Abrir em realidade aumentada</GoldButton> : null}
        {status === 'scanning' ? <GoldButton onClick={placeAr}>Posicionar a cena aqui</GoldButton> : null}
        {status === 'placed' ? <GoldButton onClick={throwAr}>Lançar a pedra</GoldButton> : null}
        {status === 'done' && defeated ? (
          <GoldButton onClick={() => onResult(true)}>Consolidar o aprendizado</GoldButton>
        ) : null}
        {status === 'done' && !defeated ? (
          <GhostButton
            onClick={() => {
              setStatus('unsupported');
              setAim(8);
              setMessage(null);
            }}
          >
            Tentar novamente
          </GhostButton>
        ) : null}
      </div>
    </section>
  );
}
