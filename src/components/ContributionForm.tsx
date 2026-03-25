import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Button, FormField } from './ui';
import Certificate from './Certificate';
import type { Dialect, Source } from '../lib/database.types';

type FormState = 'idle' | 'recording' | 'submitting' | 'success' | 'error';

const DIALECTS: { value: Dialect; label: string }[] = [
  { value: 'oriente', label: 'Oriente' },
  { value: 'noroccidente', label: 'Noroccidente' },
  { value: 'centro', label: 'Centro' },
  { value: 'sur', label: 'Sur' },
  { value: 'costa', label: 'Costa' },
  { value: 'otro', label: 'Otro / No sé' },
];

const SOURCES: { value: Source; label: string }[] = [
  { value: 'hablante_nativo', label: 'Hablante nativo' },
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'academico', label: 'Académico' },
  { value: 'evento', label: 'Evento' },
  { value: 'otro', label: 'Otro' },
];

const MAX_RECORDING_SECONDS = 60;

export default function ContributionForm() {
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [mayaText, setMayaText] = useState('');
  const [spanishTranslation, setSpanishTranslation] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [dialect, setDialect] = useState<Dialect>('oriente');
  const [source, setSource] = useState<Source>('hablante_nativo');
  const [consent, setConsent] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [successData, setSuccessData] = useState<{ entryNumber: number; totalCount: number } | null>(null);
  const [supportsRecording] = useState(() =>
    typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined'
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Pick a supported mime type — webm for Chrome/Firefox, mp4 for Safari
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : '';

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        setState('idle');
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecordingSeconds(0);
      setState('recording');

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev + 1 >= MAX_RECORDING_SECONDS) {
            recorder.stop();
            return prev + 1;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setErrorMsg('No se pudo acceder al micrófono. Puedes contribuir solo con texto.');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mayaText.trim() || !spanishTranslation.trim() || !contributorName.trim()) {
      setErrorMsg('Completa todos los campos obligatorios.');
      return;
    }
    if (!consent) {
      setErrorMsg('Debes dar tu consentimiento para contribuir.');
      return;
    }

    setState('submitting');
    setErrorMsg('');

    try {
      let audioUrl: string | null = null;

      // Upload audio via Cloudflare Worker → R2
      if (audioBlob) {
        try {
          const workerUrl = import.meta.env.PUBLIC_UPLOAD_WORKER_URL || 'http://localhost:8787';
          const { uploadUrl, publicUrl } = await fetch(`${workerUrl}/upload-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contentType: audioBlob.type || 'audio/webm' }),
          }).then((r) => r.json());

          await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': audioBlob.type || 'audio/webm' },
            body: audioBlob,
          });

          audioUrl = publicUrl;
        } catch (uploadErr) {
          console.warn('Audio upload failed, continuing without audio:', uploadErr);
        }
      }

      const { error: insertErr } = await supabase.from('contributions').insert({
        maya_text: mayaText.trim(),
        spanish_translation: spanishTranslation.trim(),
        contributor_name: contributorName.trim(),
        dialect,
        source,
        consent_given: true,
        audio_url: audioUrl,
      });

      if (insertErr) throw insertErr;

      // Get count for certificate
      const { count } = await supabase
        .from('contributions')
        .select('*', { count: 'exact', head: true });

      setSuccessData({
        entryNumber: count ?? 1,
        totalCount: count ?? 1,
      });
      setState('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al enviar. Intenta de nuevo.');
      setState('error');
    }
  }

  function handleReset() {
    setState('idle');
    setMayaText('');
    setSpanishTranslation('');
    setAudioBlob(null);
    setConsent(false);
    setSuccessData(null);
    setErrorMsg('');
  }

  if (state === 'success' && successData) {
    return (
      <div className="success-screen">
        <p className="success-maya">A t'aane' k'a'abéet</p>
        <p className="success-es">Tu voz importa</p>
        <Certificate
          contributorName={contributorName}
          entryNumber={successData.entryNumber}
          totalCount={successData.totalCount}
        />
        <Button variant="primary" onClick={handleReset}>
          Contribuir otra vez
        </Button>

        <div className="sumate-invite">
          <p className="sumate-invite-text">¿Quieres estar más cerca de la comunidad?</p>
          <a href="/hablantes" className="sumate-invite-link">
            Regístrate como hablante y ayúdanos a validar →
          </a>
        </div>
        <style>{`
          .success-screen { text-align: center; }
          .success-maya {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: var(--space-1);
          }
          .success-es {
            color: var(--text-muted);
            margin-bottom: var(--space-4);
          }
          .sumate-invite {
            margin-top: var(--space-5);
            padding: var(--space-3);
            border: 1px solid var(--surface);
            border-radius: var(--radius);
            background: var(--card-bg);
          }
          .sumate-invite-text {
            font-family: var(--font-display);
            font-weight: 700;
            font-size: 0.95rem;
            margin-bottom: var(--space-2);
          }
          .sumate-invite-link {
            font-size: 0.9rem;
            color: var(--primary);
            font-weight: 600;
          }
        `}</style>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contribution-form">
      <FormField label="A t'aan" sublabel="Tu texto en maya" htmlFor="maya-text">
        <textarea
          id="maya-text"
          value={mayaText}
          onChange={(e) => setMayaText(e.target.value)}
          placeholder="Escribe una frase, palabra o expresión en maya yucateco"
          rows={3}
          maxLength={2000}
          required
        />
      </FormField>

      <FormField label="U tsikbal ich kastelan t'aan" sublabel="Traducción al español" htmlFor="spanish-translation">
        <textarea
          id="spanish-translation"
          value={spanishTranslation}
          onChange={(e) => setSpanishTranslation(e.target.value)}
          placeholder="Traducción o significado en español"
          rows={2}
          maxLength={2000}
          required
        />
      </FormField>

      <FormField label="A k'aaba'" sublabel="Tu nombre" htmlFor="contributor-name">
        <input
          type="text"
          id="contributor-name"
          value={contributorName}
          onChange={(e) => setContributorName(e.target.value)}
          placeholder="Nombre o seudónimo"
          maxLength={200}
          required
        />
      </FormField>

      <div className="form-row">
        <FormField label="Bix a t'aan" sublabel="Variante dialectal" htmlFor="dialect">
          <select
            id="dialect"
            value={dialect}
            onChange={(e) => setDialect(e.target.value as Dialect)}
          >
            {DIALECTS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Tu'ux a kanik" sublabel="¿Cómo aprendiste?" htmlFor="source">
          <select
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value as Source)}
          >
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Audio recording — progressive enhancement */}
      {supportsRecording && (
        <FormField label="U juum a t'aan" sublabel="Audio (opcional)">
          {state === 'recording' ? (
            <Button
              type="button"
              variant="record"
              recording
              onClick={stopRecording}
              aria-label="Detener grabación"
            >
              ● {recordingSeconds}s — Detener
            </Button>
          ) : (
            <Button
              type="button"
              variant="record"
              onClick={startRecording}
              aria-label="Grabar audio / Ts'íib t'aan"
            >
              {audioBlob ? '✓ Audio grabado — Grabar de nuevo' : '○ Grabar audio'}
            </Button>
          )}
        </FormField>
      )}

      <div className="form-field consent-field">
        <label>
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
          />
          <span>
            Acepto que mi contribución sea parte del corpus abierto de maya yucateco
            bajo licencia Creative Commons.
          </span>
        </label>
      </div>

      {errorMsg && (
        <p className="form-error" role="alert">{errorMsg}</p>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={state === 'submitting'}
      >
        {state === 'submitting' ? 'Enviando...' : 'Contribuir'}
      </Button>

      <style>{`
        .contribution-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }
        @media (max-width: 480px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
        .consent-field label {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: var(--space-2);
          font-weight: 400;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .consent-field input[type="checkbox"] {
          margin-top: 3px;
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }
      `}</style>
    </form>
  );
}
