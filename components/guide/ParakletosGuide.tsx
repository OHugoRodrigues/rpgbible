'use client';

import { Cartouche, GhostButton } from '@/components/frame';
import { GENERIC_PARAKLETOS_PROFILE } from '@/src/application/demo-flow';
import type { AdaptiveJourneyStageId, PersonalizationProfile } from '@/src/domain/types';
import type { ParakletosMessage } from '@/src/llm/parakletos-types';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ParakletosAvatar } from './ParakletosAvatar';
import styles from './ParakletosGuide.module.css';

const QUESTION_MAX = 280;

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
  personalized,
  onClose,
}: {
  open: boolean;
  stageId: AdaptiveJourneyStageId;
  profile: PersonalizationProfile | null;
  personalized: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState<ParakletosMessage | null>(null);
  const [failed, setFailed] = useState(false);
  const [draft, setDraft] = useState('');
  const [question, setQuestion] = useState<string | undefined>();

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
          body: JSON.stringify({
            stageId,
            profile: profile ?? GENERIC_PARAKLETOS_PROFILE,
            question,
          }),
        });
        if (!response.ok) throw new Error(`Parakletos respondeu ${response.status}`);
        const payload = (await response.json()) as ParakletosMessage;
        if (!cancelled) {
          setFailed(false);
          setMessage(payload);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, profile, stageId, question]);

  const loading = open && !message && !failed;

  function ask(event: { preventDefault(): void }) {
    event.preventDefault();
    const next = draft.trim().slice(0, QUESTION_MAX);
    if (!next) return;
    setFailed(false);
    setMessage(null);
    setQuestion(next);
    setDraft('');
  }

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

      <ParakletosAvatar className={styles.avatar} />
      <h2 id="parakletos-title">Parakletos</h2>

      {personalized ? null : (
        <p className={styles.genericNotice}>
          Você ainda não calibrou a jornada. O guia usa um tom geral, sem fingir que já te conhece.
        </p>
      )}

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

      <form className={styles.ask} onSubmit={ask}>
        <label htmlFor="parakletos-question">Perguntar ao guia</label>
        <input
          id="parakletos-question"
          maxLength={QUESTION_MAX}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Uma dúvida curta sobre esta etapa…"
        />
      </form>

      <GhostButton onClick={onClose}>Voltar à jornada</GhostButton>
    </dialog>
  );
}
