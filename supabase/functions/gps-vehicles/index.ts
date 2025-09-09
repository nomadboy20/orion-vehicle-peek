import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const groupCode = url.searchParams.get('groupCode') || 'SAGU';
    
    const apiUrl = `https://a1.gpsguard.eu/api/v1/vehicles/group/${groupCode}`;
    const username = "api_gpsdozor";
    const password = "yakmwlARdn";
    
    // Use btoa for base64 encoding in Deno
    const auth = btoa(`${username}:${password}`);

    const response = await fetch(apiUrl, {
      headers: {
        "Authorization": `Basic ${auth}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch vehicles', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});