"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

// Owns the song's <audio> element and its real-time beat detection, mounted
// once around every step from the photo album onward (see page.tsx) so
// playback survives moving between screens instead of restarting/cutting
// off each time a step component unmounts — she wants the song to keep
// playing continuously through to the end of the site (or the end of the
// song itself, whichever comes first; no `loop`, per an earlier request).
// Only PhotoAlbum currently reads the beat count (for its photo entrances),
// but any later step could subscribe via useMusicBeat() too.

// Beat detection tuning — energy-based onset detection on the bass frequency
// bins, not true beat-tracking. Good enough to make things feel like they're
// following the song's rhythm without needing hand-authored timestamps.
const MIN_BEAT_INTERVAL_MS = 320;
const ENERGY_THRESHOLD_MULT = 1.35;
const MIN_ENERGY = 40;
// If no real beat has landed in this long (autoplay blocked, a quiet
// stretch, the song has ended), synthesize one so anything watching the
// beat count keeps advancing instead of getting stuck.
const FALLBACK_BEAT_MS = 900;

const MusicContext = createContext<number>(0);

export function useMusicBeat() {
  return useContext(MusicContext);
}

export default function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [beatCount, setBeatCount] = useState(0);

  // `createMediaElementSource` can only ever be called once per <audio>
  // element for its whole lifetime (throws on a second call, even against a
  // fresh AudioContext) — React Strict Mode double-invokes effects in dev,
  // so the analyser/context are built once and cached in a ref rather than
  // recreated on every effect run.
  const analyserRef = useRef<AnalyserNode | null>(null);
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (!analyserRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const source = audioCtx.createMediaElementSource(audioEl);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      analyserRef.current = analyser;
    }
    const analyser = analyserRef.current;

    audioEl.play().catch(() => {
      // Autoplay blocked by the browser — the site still works, just without
      // music/beat-synced entrances until she interacts with the page.
    });

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let lastBeatTime = 0;
    let runningAvg = 0;
    let rafId: number;

    function tick() {
      analyser!.getByteFrequencyData(dataArray);
      const bassBins = dataArray.slice(0, 8);
      const energy = bassBins.reduce((a, b) => a + b, 0) / bassBins.length;
      runningAvg = runningAvg * 0.95 + energy * 0.05;

      const now = performance.now();
      const isRealBeat =
        energy > runningAvg * ENERGY_THRESHOLD_MULT &&
        energy > MIN_ENERGY &&
        now - lastBeatTime > MIN_BEAT_INTERVAL_MS;
      const isFallbackBeat = now - lastBeatTime > FALLBACK_BEAT_MS;
      if (isRealBeat || isFallbackBeat) {
        lastBeatTime = now;
        setBeatCount((c) => c + 1);
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      // Not closing the AudioContext here — Strict Mode's cleanup+rerun
      // needs the analyser to still exist for the next effect invocation.
      // The browser tears everything down on real page unload anyway.
    };
  }, []);

  return (
    <MusicContext.Provider value={beatCount}>
      {/* No `loop` — plays once from the start through to its natural end. */}
      <audio ref={audioRef} src="/audio/two-is-better-than-one.mp3" />
      {children}
    </MusicContext.Provider>
  );
}
