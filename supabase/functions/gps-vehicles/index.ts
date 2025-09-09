import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 Edge function called:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let groupCode = 'SAGU';
    
    // Try to get groupCode from POST body first
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        console.log('📦 Request body:', body);
        groupCode = body.groupCode || 'SAGU';
      } catch (e) {
        console.log('⚠️ Could not parse JSON body, using default groupCode');
      }
    } else {
      // Fallback to URL params for GET requests
      const url = new URL(req.url);
      groupCode = url.searchParams.get('groupCode') || 'SAGU';
    }
    
    console.log('🎯 Using groupCode:', groupCode);
    
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

    console.log('📡 GPS API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GPS API Error:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ GPS API success, vehicles count:', Array.isArray(data) ? data.length : 'not array');

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