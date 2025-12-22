import { useRef, useState, useEffect } from 'react';

export const useBPMDetection = (ecgBuffer: number[], threshold: number = 600) => {
  const [bpm, setBpm] = useState(0);
  const lastPeakTimeRef = useRef<number>(Date.now());
  const peakIntervalsRef = useRef<number[]>([]);
  const lastValueRef = useRef<number>(0);

  useEffect(() => {
    if (ecgBuffer.length < 2) return;

    const currentValue = ecgBuffer[ecgBuffer.length - 1];
    const previousValue = lastValueRef.current;
    lastValueRef.current = currentValue;

    // Detect R-peak (threshold crossing from below)
    if (previousValue < threshold && currentValue >= threshold) {
      const now = Date.now();
      const interval = now - lastPeakTimeRef.current;

      // Only count if interval is reasonable (300ms to 2000ms = 30-200 BPM)
      if (interval > 300 && interval < 2000) {
        peakIntervalsRef.current.push(interval);
        
        // Keep only last 5 intervals for averaging
        if (peakIntervalsRef.current.length > 5) {
          peakIntervalsRef.current.shift();
        }

        // Calculate average BPM
        if (peakIntervalsRef.current.length >= 2) {
          const avgInterval = peakIntervalsRef.current.reduce((a, b) => a + b, 0) / peakIntervalsRef.current.length;
          const calculatedBpm = Math.round(60000 / avgInterval);
          setBpm(calculatedBpm);
        }
      }

      lastPeakTimeRef.current = now;
    }
  }, [ecgBuffer, threshold]);

  return bpm;
};

