'use client';

import { Cartouche, GhostButton } from '@/components/frame';
import type { AdaptiveJourneyStageId, PersonalizationProfile } from '@/src/domain/types';
import type { ParakletosMessage } from '@/src/llm/parakletos-types';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import styles from './ParakletosGuide.module.css';

const DEFAULT_PROFILE: PersonalizationProfile = {
  audienceTone: 'teen',
  biblicalLiteracy: 'developing',
  experienceMode: 'balanced',
  narrativePreference: 'adventure',
};

/**
 * Parakletos — guia educativo.
 *
 * O payload usa exatamente os tipos do domínio; enviar um `audienceTone` fora
 * da união faz a rota responder 400 silenciosamente. O aviso de identidade
 * acompanha toda resposta, vinda da LLM ou do fallback curado.
 */
export function ParakletosGuide({
  open,
  stageId,
  profile,
  onClose,
}: {
  open: boolean;
  stageId: AdaptiveJourneyStageId;
  profile: PersonalizationProfile | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState<ParakletosMessage | null>(null);
  const [failed, setFailed] = useState(false);

  /* Reset ao abrir/fechar, ajustado durante o render em vez de num efeito. */
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    setMessage(null);
    setFailed(false);
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch('/api/parakletos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stageId, profile: profile ?? DEFAULT_PROFILE }),
        });
        if (!response.ok) throw new Error(`Parakletos respondeu ${response.status}`);
        const payload = (await response.json()) as ParakletosMessage;
        if (!cancelled) setMessage(payload);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, profile, stageId]);

  const loading = open && !message && !failed;

  return (
    <dialog
      ref={dialogRef}
      className={styles.overlay}
      onClose={onClose}
      aria-labelledby="parakletos-title"
    >
      <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
        <X aria-hidden="true" />
      </button>

      <img className={styles.avatar} src="/assets/characters/parakletos-flight.png" alt="" />
      <h2 id="parakletos-title">Parakletos</h2>

      <div className={styles.body} aria-live="polite">
        {loading ? <p className={styles.text}>Consultando a passagem…</p> : null}

        {failed ? (
          <p className={styles.text}>
            O guia não respondeu agora. Volte à cena — a próxima pista já está lá.
          </p>
        ) : null}

        {message ? (
          <>
            <p className={styles.text}>{message.message}</p>
            <Cartouche reference={message.biblicalReference} />
            <p className={styles.question}>{message.reflectionQuestion}</p>
            <small className={styles.notice}>{message.identityNotice}</small>
          </>
        ) : null}
      </div>

      <GhostButton onClick={onClose}>Voltar à jornada</GhostButton>
    </dialog>
  );
}
