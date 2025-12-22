import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Phone, Mail, Save, Check, TestTube } from 'lucide-react';
import { toast } from 'sonner';

interface AlertConfig {
  whatsappNumber: string;
  email: string;
  alertsEnabled: boolean;
}

const AlertConfigPanel = () => {
  const [config, setConfig] = useState<AlertConfig>({
    whatsappNumber: '',
    email: '',
    alertsEnabled: false
  });
  const [saved, setSaved] = useState(false);

  // Load saved config
  useEffect(() => {
    const savedConfig = localStorage.getItem('alertConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const sendTestAlert = async () => {
    try {
      const alertMessage = `⚠️ ECG Test Alert\n\nThis is a test emergency alert from Hridaya Rakshak.\n\nTime: ${new Date().toLocaleString()}`;

      let whatsappStatus: 'sent' | 'failed' | 'pending' = 'pending';
      let emailStatus: 'sent' | 'failed' | 'pending' = 'pending';

      // Send WhatsApp alert
      if (config.whatsappNumber) {
        const { error: whatsappError } = await supabase.functions.invoke('send-whatsapp', {
          body: {
            phone: config.whatsappNumber,
            message: alertMessage
          }
        });

        whatsappStatus = whatsappError ? 'failed' : 'sent';
        if (whatsappError) {
          console.error('WhatsApp alert error:', whatsappError);
        }
      }

      // Send Email alert
      if (config.email) {
        const { error: emailError } = await supabase.functions.invoke('send-email', {
          body: {
            to: config.email,
            subject: '⚠️ ECG Test Alert from Hridaya Rakshak',
            body: alertMessage
          }
        });

        emailStatus = emailError ? 'failed' : 'sent';
        if (emailError) {
          console.error('Email alert error:', emailError);
        }
      }

      // Add to alert history
      const alertEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        whatsappStatus,
        emailStatus,
      };

      window.dispatchEvent(new CustomEvent('newAlert', { detail: alertEntry }));

      toast.success('Test alerts sent!', {
        description: 'Check your WhatsApp and email',
        duration: 5000
      });
    } catch (error) {
      console.error('Failed to send alerts:', error);
      toast.error('Failed to send test alerts');
    }
  };

  const handleSave = () => {
    if (config.alertsEnabled && !config.whatsappNumber && !config.email) {
      toast.error('Please add at least one contact method');
      return;
    }

    localStorage.setItem('alertConfig', JSON.stringify(config));
    setSaved(true);
    toast.success('Alert configuration saved!');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="border-2 bg-zinc-800">
      <div className="p-4 border-b bg-zinc-800">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <h3 className="font-semibold text-lg text-slate-50">Alert Configuration</h3>
        </div>
      </div>

      <div className="p-6 space-y-4 bg-zinc-800">
        {/* WhatsApp Number */}
        <div className="space-y-2">
          <Label htmlFor="whatsapp" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            WhatsApp Number
          </Label>
          <Input
            id="whatsapp"
            type="tel"
            placeholder="+1234567890"
            value={config.whatsappNumber}
            onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Include country code (e.g., +1 for US)
          </p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="alert@example.com"
            value={config.email}
            onChange={(e) => setConfig({ ...config, email: e.target.value })}
          />
        </div>

        {/* Enable Alerts Toggle */}
        <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="enable-alerts">Enable Alerts</Label>
            <p className="text-xs text-muted-foreground">
              Automatically send WhatsApp and email alerts for ECG anomalies
            </p>
          </div>
          <Switch
            id="enable-alerts"
            checked={config.alertsEnabled}
            onCheckedChange={(checked) => setConfig({ ...config, alertsEnabled: checked })}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            variant={saved ? 'secondary' : 'default'}
            className="flex-1 gap-2"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </Button>

          <Button
            onClick={sendTestAlert}
            variant="outline"
            className="flex-1 gap-2"
            disabled={!config.whatsappNumber && !config.email}
          >
            <TestTube className="h-4 w-4" />
            Test Alert
          </Button>
        </div>

        {/* Status Badge */}
        <div className="pt-2">
          {!config.whatsappNumber && !config.email ? (
            <Badge variant="outline" className="text-warning border-warning">
              No contacts configured
            </Badge>
          ) : config.alertsEnabled ? (
            <Badge variant="outline" className="text-success border-success">
              Alerts enabled and ready
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Alerts disabled
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AlertConfigPanel;
