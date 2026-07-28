// Supabase Edge Function: send-push-notification
// Purpose: Listens to inserts on public.notifications and sends native Expo push notifications.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const record = payload?.record; // The inserted notification row from public.notifications

    if (!record || !record.user_id) {
      return new Response(
        JSON.stringify({ message: "Invalid webhook payload or missing user_id" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables are missing.");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user push token safely using .maybeSingle() instead of .single()
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("push_token")
      .eq("id", record.user_id)
      .maybeSingle();

    if (userError) {
      console.error("Database query error:", userError.message);
      return new Response(
        JSON.stringify({ error: "Failed to query user push token", details: userError.message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const pushToken = user?.push_token;

    // Validate that the push token exists and matches Expo push token format
    if (!pushToken || typeof pushToken !== "string" || !pushToken.trim()) {
      return new Response(
        JSON.stringify({ message: "No push_token registered for user", userId: record.user_id }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Send Push Notification payload via Expo Push API
    const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: pushToken,
        sound: "default",
        title: record.title,
        body: record.body,
        data: record.data ?? {},
        priority: "high",
      }),
    });

    const expoResult = await expoResponse.json();

    if (!expoResponse.ok) {
      console.error("Expo Push Service Error:", expoResult);
      return new Response(
        JSON.stringify({ error: "Expo API error", details: expoResult }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: expoResponse.status,
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, expoResult }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err: any) {
    console.error("Edge Function Error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message || "Internal Server Error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
