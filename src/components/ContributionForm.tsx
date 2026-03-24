import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
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
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
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
        <button type="button" className="btn btn-primary" onClick={handleReset}>
          Contribuir otra vez
        </button>
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
        `}</style>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contribution-form">
      <div className="form-field">
        <label htmlFor="maya-text">Texto en maya</label>
        <textarea
          id="maya-text"
          value={mayaText}
          onChange={(e) => setMayaText(e.target.value)}
          placeholder="Escribe una frase, palabra o expresión en maya yucateco"
          rows={3}
          maxLength={2000}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="spanish-translation">Traducción al español</label>
        <textarea
          id="spanish-translation"
          value={spanishTranslation}
          onChange={(e) => setSpanishTranslation(e.target.value)}
          placeholder="Traducción o significado en español"
          rows={2}
          maxLength={2000}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="contributor-name">Tu nombre</label>
        <input
          type="text"
          id="contributor-name"
          value={contributorName}
          onChange={(e) => setContributorName(e.target.value)}
          placeholder="Nombre o seudónimo"
          maxLength={200}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="dialect">Variante dialectal</label>
          <select
            id="dialect"
            value={dialect}
            onChange={(e) => setDialect(e.target.value as Dialect)}
          >
            {DIALECTS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="source">¿Cómo aprendiste maya?</label>
          <select
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value as Source)}
          >
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audio recording — progressive enhancement */}
      {supportsRecording && (
        <div className="form-field">
          <label>Audio (opcional)</label>
          {state === 'recording' ? (
            <button
              type="button"
              className="btn btn-record recording"
              onClick={stopRecording}
              aria-label="Detener grabación"
            >
              ● {recordingSeconds}s — Detener
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-record"
              onClick={startRecording}
              aria-label="Grabar audio / Ts'íib t'aan"
            >
              {audioBlob ? '✓ Audio grabado — Grabar de nuevo' : '○ Grabar audio'}
            </button>
          )}
        </div>
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

      <button
        type="submit"
        className="btn btn-primary"
        disabled={state === 'submitting'}
      >
        {state === 'submitting' ? 'Enviando...' : 'Contribuir'}
      </button>

      <style>{`
        .contribution-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .form-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .form-field label {
          font-weight: 600;
          font-size: 0.9rem;
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
        textarea,
        input[type="text"],
        select {
          padding: var(--space-3);
          border: 1px solid var(--surface);
          border-radius: var(--radius);
          background: white;
          width: 100%;
        }
        textarea:focus,
        input[type="text"]:focus,
        select:focus {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }
        .consent-field label {
          display: flex;
          align-items: flex-start;
          gap: var(--space-2);
          font-weight: 400;
          cursor: pointer;
        }
        .consent-field input[type="checkbox"] {
          margin-top: 3px;
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }
        .btn {
          padding: var(--space-3);
          border: 1px solid var(--surface);
          border-radius: var(--radius);
          cursor: pointer;
          font-weight: 600;
          min-height: 44px;
          text-align: center;
        }
        .btn-primary {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        .btn-primary:hover {
          opacity: 0.9;
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-record {
          background: white;
        }
        .btn-record.recording {
          background: #FEE;
          border-color: var(--error);
          color: var(--error);
        }
        .form-error {
          color: var(--error);
          font-size: 0.9rem;
        }
      `}</style>
    </form>
  );
}
