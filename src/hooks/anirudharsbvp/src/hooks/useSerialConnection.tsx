import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export const useSerialConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const isConnectingRef = useRef(false);

  const connectArduino = useCallback(async () => {
    // Prevent double-open
    if (isConnectingRef.current || isConnected) {
      toast.error('Already connected or connecting');
      return;
    }

    try {
      isConnectingRef.current = true;

      if (!('serial' in navigator)) {
        toast.error('Web Serial API not supported in this browser');
        isConnectingRef.current = false;
        return;
      }

      // Request and open port
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      portRef.current = port;
      setIsConnected(true);
      toast.success('Arduino connected!');

      // Get reader from port.readable
      const reader = port.readable.getReader();
      readerRef.current = reader;

      // Buffer for accumulating partial lines
      let buffer = '';
      const decoder = new TextDecoder();

      // Read loop
      const readLoop = async () => {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            // Decode incoming bytes to text
            const text = decoder.decode(value, { stream: true });
            buffer += text;

            // Process complete lines (split by newline)
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete tail in buffer

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed) {
                // Parse integer from analogRead(A0)
                const ecgValue = parseInt(trimmed, 10);
                if (!isNaN(ecgValue)) {
                  // Dispatch ECG data event with integer value
                  window.dispatchEvent(new CustomEvent<number>('ecgData', { 
                    detail: ecgValue 
                  }));
                }
              }
            }
          }
        } catch (error) {
          if ((error as Error).name !== 'NetworkError') {
            console.error('Serial read error:', error);
          }
        }
      };

      readLoop();
      isConnectingRef.current = false;

    } catch (error) {
      console.error('Failed to connect to Arduino:', error);
      toast.error('Failed to connect to Arduino');
      isConnectingRef.current = false;
      setIsConnected(false);
    }
  }, [isConnected]);

  const disconnectArduino = useCallback(async () => {
    try {
      // Cancel reader
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current.releaseLock();
        readerRef.current = null;
      }
      
      // Close port
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
      
      setIsConnected(false);
      isConnectingRef.current = false;
      toast.info('Arduino disconnected');
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast.error('Error disconnecting Arduino');
    }
  }, []);

  return {
    isConnected,
    connectArduino,
    disconnectArduino
  };
};
