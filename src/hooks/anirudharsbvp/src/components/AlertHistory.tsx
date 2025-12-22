import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, CheckCircle2, XCircle, Activity } from "lucide-react";

export interface AlertHistoryEntry {
  id: string;
  timestamp: number;
  whatsappStatus: 'sent' | 'failed' | 'pending';
  emailStatus: 'sent' | 'failed' | 'pending';
  location?: {
    latitude: number;
    longitude: number;
  };
}

const AlertHistory = () => {
  const [history, setHistory] = useState<AlertHistoryEntry[]>([]);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('alertHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    // Listen for new alerts
    const handleNewAlert = (event: CustomEvent<AlertHistoryEntry>) => {
      const newEntry = event.detail;
      setHistory(prev => {
        const updated = [newEntry, ...prev].slice(0, 50); // Keep last 50 alerts
        localStorage.setItem('alertHistory', JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener('newAlert' as any, handleNewAlert);
    return () => window.removeEventListener('newAlert' as any, handleNewAlert);
  }, []);

  const getStatusIcon = (status: 'sent' | 'failed' | 'pending') => {
    switch (status) {
      case 'sent':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-emergency" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="border-2 glass-card animate-fade-in-up">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-primary" />
          Alert History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No alerts triggered yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-lg border bg-card hover-lift"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emergency" />
                        <span className="font-semibold text-sm">
                          ECG Alert Triggered
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(entry.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(entry.whatsappStatus)}
                      <span className="text-xs text-muted-foreground">
                        WhatsApp
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(entry.emailStatus)}
                      <span className="text-xs text-muted-foreground">
                        Email
                      </span>
                    </div>
                  </div>

                  {entry.location && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        📍 {entry.location.latitude.toFixed(4)}, {entry.location.longitude.toFixed(4)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AlertHistory;
