// src/components/ECGMonitor.tsx
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Activity } from "lucide-react";
import { toast } from "sonner";

interface ECGMonitorProps {
  bpm?: number;
  onBufferUpdate?: (buffer: number[]) => void;
  /**
   * Optional callback invoked when a STEMI is detected.
   * Receives an object: { level: number, durationMs: number }
   */
  onStemiDetected?: (info: { level: number; durationMs: number }) => void;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// small utility: exponential moving average
const ema = (prev: number, value: number, alpha: number) => prev + alpha * (value - prev);

const ECGMonitor = ({ bpm = 0, onBufferUpdate, onStemiDetected }: ECGMonitorProps) => {
  // UI + chart state
  const [ecgData, setEcgData] = useState<number[]>([]);
  const [chartReady, setChartReady] = useState(false);
  const [isStemi, setIsStemi] = useState(false);
  const [stemiLevel, setStemiLevel] = useState<number | null>(null);

  // buffers & refs
  const bufferRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(Date.now());
  const lastValueRef = useRef<number>(0);

  // Detection state refs (keeps across renders)
  const baselineRef = useRef<number>(0);         // long-term baseline (EMA)
  const stRef = useRef<number>(0);               // short-term ST average (EMA)
  const amplitudeRef = useRef<number>(1);        // running estimate of signal amplitude
  const stStartRef = useRef<number | null>(null);
  const clearedAtRef = useRef<number | null>(null);
  const stTriggeredRef = useRef(false);

  // CONFIGURABLE PARAMETERS (tune these for your setup)
  const SAMPLE_RATE = 200;            // samples per second (adjust to match Arduino sampling)
  const MAX_POINTS = 600;             // number of points visible in the chart window
  const BASELINE_SECONDS = 8;         // how long baseline averages over (seconds)
  const ST_WINDOW_MS = 250;           // how long short-term ST average computes (ms)
  const MIN_STEMI_MS = 300;           // how long elevation must persist to trigger STEMI (ms)
  const CLEAR_AFTER_MS = 800;        // require this much clear time to reset flag (ms)

  // thresholds (relative): fraction of typical amplitude
  // If ST short-average exceeds baseline by > ST_THRESHOLD * amplitude => consider elevated
  const ST_THRESHOLD = 0.12; // 12% of amplitude (safe starting point; increase/decrease to tune)

  // Derived smoothing alphas for EMA from ms and sample rate
  const alphaFromMs = (ms: number) => {
    const dt = 1000 / SAMPLE_RATE;
    // alpha for EMA approximating window of length = ms
    const tau = Math.max(ms, dt);
    // approximate alpha from RC filter tau: alpha = dt / (tau + dt)
    return dt / (tau + dt);
  };

  const baselineAlpha = alphaFromMs(BASELINE_SECONDS * 1000); // very small alpha
  const stAlpha = alphaFromMs(ST_WINDOW_MS);

  // register chart once
  useEffect(() => {
    setChartReady(true);
  }, []);

  // Main event listener (receives single-sample numeric events)
  useEffect(() => {
    const handleECGData = (event: Event) => {
      const customEvent = event as CustomEvent<number>;
      const raw = customEvent.detail;

      if (typeof raw !== "number" || isNaN(raw)) return;

      // Keep last raw value
      lastValueRef.current = raw;

      // Update amplitude estimate (use EMA of absolute deviation)
      const prevAmp = amplitudeRef.current;
      const absDev = Math.abs(raw - (baselineRef.current || raw));
      // alpha for amplitude smoother: use medium window (200-500ms)
      amplitudeRef.current = ema(prevAmp, Math.max(absDev, 1e-6), 0.05);

      // Update baseline & short-term ST EMAs
      baselineRef.current = ema(baselineRef.current || raw, raw, baselineAlpha);
      stRef.current = ema(stRef.current || raw, raw, stAlpha);

      // For plotting, optionally apply small smoothing
      const smoothed = ema(lastValueRef.current || raw, raw, 0.2);
      lastValueRef.current = smoothed;

      // Push to sliding window buffer
      bufferRef.current.push(smoothed);
      if (bufferRef.current.length > MAX_POINTS) {
        bufferRef.current = bufferRef.current.slice(-MAX_POINTS);
      }

      // notify parent buffer update
      if (onBufferUpdate) onBufferUpdate(bufferRef.current);

      // STEMI detection logic (relative threshold)
      const stLevel = stRef.current;
      const baseline = baselineRef.current;
      const amplitude = Math.max(amplitudeRef.current, 1); // avoid divide-by-zero

      const delta = stLevel - baseline;
      const relative = delta / amplitude; // e.g., 0.15 means 15% of amplitude

      const now = Date.now();

      // If relative exceeds threshold -> candidate for ST elevation
      if (relative > ST_THRESHOLD) {
        if (stStartRef.current === null) {
          stStartRef.current = now;
        }

        // If persisted long enough and not already triggered
        const elapsed = now - (stStartRef.current || now);
        if (elapsed >= MIN_STEMI_MS && !stTriggeredRef.current) {
          // Trigger STEMI
          stTriggeredRef.current = true;
          setIsStemi(true);
          setStemiLevel(Number(relative.toFixed(3)));
          // dispatch event
          window.dispatchEvent(new CustomEvent("stemiDetected", {
            detail: { level: relative, durationMs: elapsed }
          }));
          // optional callback
          if (onStemiDetected) {
            try { onStemiDetected({ level: relative, durationMs: elapsed }); } catch (e) {}
          }
          // show toast immediate feedback
          try { toast.error("ST elevation detected (STEMI) — check patient & alert emergency"); } catch(e) {}
        }
        // reset clearedAt
        clearedAtRef.current = null;
      } else {
        // Clear condition when relative falls below threshold
        if (stTriggeredRef.current) {
          // start timing for clear
          if (clearedAtRef.current === null) clearedAtRef.current = now;
          const clearElapsed = now - (clearedAtRef.current || now);
          if (clearElapsed >= CLEAR_AFTER_MS) {
            // reset detection
            stTriggeredRef.current = false;
            stStartRef.current = null;
            clearedAtRef.current = null;
            setIsStemi(false);
            setStemiLevel(null);
            // dispatch clear event
            window.dispatchEvent(new CustomEvent("stemiCleared", { detail: {} }));
          }
        } else {
          // Not triggered; reset start if any brief blip vanished
          stStartRef.current = null;
        }
      }

      // Throttle UI updates with requestAnimationFrame (target ~60fps)
      if (now - lastUpdateRef.current > 16) {
        lastUpdateRef.current = now;
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = requestAnimationFrame(() => {
          setEcgData([...bufferRef.current]);
        });
      }
    };

    window.addEventListener("ecgData", handleECGData);

    return () => {
      window.removeEventListener("ecgData", handleECGData);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onBufferUpdate, onStemiDetected]);

  // Chart config
  const chartData = {
    labels: ecgData.map((_, index) => index),
    datasets: [
      {
        label: "ECG",
        data: ecgData,
        borderColor: isStemi ? "hsl(0 80% 60%)" : "hsl(var(--success))",
        backgroundColor: "transparent",
        borderWidth: 2,
        fill: false,
        tension: 0.35,
        cubicInterpolationMode: "monotone" as const,
        pointRadius: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: {
        display: true,
        grid: {
          color: "hsl(var(--ecg-grid))",
          lineWidth: 0.5
        },
        ticks: {
          color: "hsl(var(--muted-foreground))",
          font: { size: 10 }
        }
      }
    },
    elements: {
      line: {
        borderCapStyle: "round" as const,
        borderJoinStyle: "round" as const
      }
    }
  } as const;

  // Helper to test detection manually from console:
  // window.dispatchEvent(new CustomEvent('ecgData',{detail: someNumber}));
  // Or dispatch long sustained elevated values to trigger.

  return (
    <Card className="overflow-hidden border-2 relative">
      <div className="p-4 border-b bg-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className={`h-5 w-5 ${isStemi ? "text-red-400 animate-pulse" : "text-success"}`} />
          <h3 className="font-semibold text-lg">{isStemi ? "ECG Monitor — ALERT" : "ECG Monitor"}</h3>
        </div>
        <div className="text-right">
          {isStemi ? (
            <div className="text-sm font-bold text-red-400">STEMI Detected {stemiLevel ? `(${(stemiLevel * 100).toFixed(1)}%)` : ""}</div>
          ) : (
            <>
              <div className="text-xs text-muted-foreground">Heart Rate</div>
              <div className="text-2xl font-bold text-success">{bpm > 0 ? bpm : "--"} <span className="text-sm">BPM</span></div>
            </>
          )}
        </div>
      </div>

      <div className="relative h-64 bg-background p-4">
        {!chartReady ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50 animate-pulse" />
              <p>Initializing chart...</p>
            </div>
          </div>
        ) : ecgData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Waiting for ECG data...</p>
              <p className="text-xs mt-1">Connect Arduino to start monitoring</p>
            </div>
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </Card>
  );
};

export default ECGMonitor;