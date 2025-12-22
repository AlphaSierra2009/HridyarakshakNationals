import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";

// register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

type LeadBuffers = {
  I: number[];
  II: number[];
  III: number[];
  aVR: number[];
  aVL: number[];
  aVF: number[];
};

const MAX_POINTS = 300; // per-lead window (adjust for width/performance)
const SMOOTH_FACTOR = 0.18;

const lowPass = (value: number, prev: number, alpha = SMOOTH_FACTOR) => prev + alpha * (value - prev);

const makeChartData = (data: number[]) => ({
  labels: data.map((_, i) => i),
  datasets: [
    {
      label: "ECG",
      data,
      borderColor: "#00ff55",
      backgroundColor: "transparent",
      borderWidth: 1.6,
      pointRadius: 0,
      tension: 0.35,
      cubicInterpolationMode: "monotone" as const,
    },
  ],
});

const smallChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 0 },
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  scales: {
    x: { display: false },
    y: {
      display: true,
      ticks: { display: false },
      grid: { color: "rgba(255,255,255,0.04)", lineWidth: 0.4 },
      // keep autoscale loose
    },
  },
  elements: { line: { borderCapStyle: "round", borderJoinStyle: "round" } },
};

export default function SixLeadECG() {
  const [open, setOpen] = useState(false);
  const buffersRef = useRef<LeadBuffers>({
    I: [],
    II: [],
    III: [],
    aVR: [],
    aVL: [],
    aVF: [],
  });
  const lastRef = useRef({
    raw: 0,
    I: 0,
    II: 0,
    III: 0,
  });

  // We'll keep per-lead state so charts re-render quickly but not too often
  const [, setTick] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handle = (ev: Event) => {
      const value = (ev as CustomEvent<number>).detail;
      if (typeof value !== "number" || isNaN(value)) return;

      // treat incoming as Lead II (LL - RA)
      // In absence of separate RA/LA/LL channels we derive others using formulas
      // We'll normalize by subtracting a running baseline (simple)
      const baselineRaw = lastRef.current.raw;
      const raw = value; // unmodified sample
      lastRef.current.raw = lowPass(raw, baselineRaw, 0.02); // baseline slowly follows

      // For derivation we use: I = LA - RA, II = LL - RA (incoming), III = LL - LA
      // We don't have separate RA/LA/LL — but we can treat incoming as II and derive I by small transform:
      // We'll create synthetic LA and RA approximations.
      // Simple approach: assume RA is a small offset from raw; LA is raw - K (gives some lead shape).
      // This is simulation — the formulas below produce visually-distinct leads.
      const approxLL = raw;
      const approxRA = lastRef.current.raw * 0.3; // small reference
      const approxLA = approxLL * 0.6 + approxRA * 0.4; // synthetic mix

      const leadI = approxLA - approxRA;
      const leadII = approxLL - approxRA;
      const leadIII = approxLL - approxLA;

      // augmented leads
      const aVR = -(leadI + leadII) / 2;
      const aVL = leadI - leadII / 2;
      const aVF = leadII - leadI / 2;

      // smoothing per series
      const lastI = lastRef.current.I;
      const lastII = lastRef.current.II;
      const lastIII = lastRef.current.III;

      const sI = lowPass(leadI, lastI);
      const sII = lowPass(leadII, lastII);
      const sIII = lowPass(leadIII, lastIII);

      lastRef.current.I = sI;
      lastRef.current.II = sII;
      lastRef.current.III = sIII;

      // push into buffers
      const b = buffersRef.current;
      const push = (arr: number[], v: number) => {
        arr.push(v);
        if (arr.length > MAX_POINTS) arr.splice(0, arr.length - MAX_POINTS);
      };

      push(b.I, sI);
      push(b.II, sII);
      push(b.III, sIII);
      push(b.aVR, aVR);
      push(b.aVL, aVL);
      push(b.aVF, aVF);

      // schedule render at most ~60fps
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          setTick((t) => t + 1);
        });
      }
    };

    window.addEventListener("ecgData", handle);
    return () => {
      window.removeEventListener("ecgData", handle);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // convenience: get arrays for charts
  const b = buffersRef.current;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">View 6-Lead</Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl w-full bg-zinc-900 text-white">
        <DialogHeader>
          <DialogTitle>6-Lead ECG (Simulated)</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="h-28 bg-black p-1 border border-zinc-700">
            <div className="text-xs text-zinc-400 px-1">Lead I</div>
            <div className="h-20">
              <Line data={makeChartData(b.I)} options={smallChartOptions} />
            </div>
          </div>

          <div className="h-28 bg-black p-1 border border-zinc-700">
            <div className="text-xs text-zinc-400 px-1">Lead II</div>
            <div className="h-20">
              <Line data={makeChartData(b.II)} options={smallChartOptions} />
            </div>
          </div>

          <div className="h-28 bg-black p-1 border border-zinc-700">
            <div className="text-xs text-zinc-400 px-1">Lead III</div>
            <div className="h-20">
              <Line data={makeChartData(b.III)} options={smallChartOptions} />
            </div>
          </div>

          <div className="h-28 bg-black p-1 border border-zinc-700">
            <div className="text-xs text-zinc-400 px-1">aVR</div>
            <div className="h-20">
              <Line data={makeChartData(b.aVR)} options={smallChartOptions} />
            </div>
          </div>

          <div className="h-28 bg-black p-1 border border-zinc-700">
            <div className="text-xs text-zinc-400 px-1">aVL</div>
            <div className="h-20">
              <Line data={makeChartData(b.aVL)} options={smallChartOptions} />
            </div>
          </div>

          <div className="h-28 bg-black p-1 border border-zinc-700">
            <div className="text-xs text-zinc-400 px-1">aVF</div>
            <div className="h-20">
              <Line data={makeChartData(b.aVF)} options={smallChartOptions} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}