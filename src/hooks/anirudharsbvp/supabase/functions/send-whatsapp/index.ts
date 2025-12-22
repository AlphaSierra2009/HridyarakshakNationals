import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, message } = await req.json();

    if (!phone || !message) {
      throw new Error('Phone number and message are required');
    }

    // CallMeBot WhatsApp API
    // Note: Users need to register their number first at https://www.callmebot.com/blog/free-api-whatsapp-messages/
    const encodedMessage = encodeURIComponent(message);
    const apiUrl = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMessage}&apikey=0000`;

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`CallMeBot API error: ${response.status}`);
    }

    console.log('WhatsApp message sent successfully:', { phone, timestamp: new Date() });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'WhatsApp alert sent successfully' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
