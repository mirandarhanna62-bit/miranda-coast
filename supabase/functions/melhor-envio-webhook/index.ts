import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookBody {
  event?: string;
  data?: {
    id?: string; // id da etiqueta no Melhor Envio
    protocol?: string; // opcional
    status?: string;
    tracking?: string | null;
    self_tracking?: string | null;
    tracking_url?: string | null;
    tags?: { tag?: string; url?: string }[];
  };
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  // Melhor Envio pode fazer um teste simples (GET/POST sem body); devolva 200.
  if (req.method === "GET") {
    return new Response(JSON.stringify({ success: true, message: "OK" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    let body: WebhookBody | null = null;
    try {
      body = (await req.json()) as WebhookBody;
    } catch {
      // corpo vazio ou inválido: para testes do provedor, apenas siga adiante com body nulo
      body = null;
    }

    console.log("Webhook ME received:", JSON.stringify(body));

    // Extrai order_id salvo em tags (tag = id do pedido)
    const orderIdTag =
      body?.data?.tags?.find((t) => t?.tag)?.tag ||
      null;
    const tracking =
      body?.data?.tracking ||
      body?.data?.self_tracking ||
      null;
    const shippingStatus = body?.data?.status || null;

    if (orderIdTag) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Supabase credentials not configured");
      }
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const updatePayload: any = {
        updated_at: new Date().toISOString(),
      };
      if (tracking) updatePayload.tracking_code = tracking;
      if (shippingStatus) updatePayload.shipping_status = shippingStatus;
      if (Object.keys(updatePayload).length > 1) {
        const { error } = await supabase
          .from("orders")
          .update(updatePayload)
          .eq("id", orderIdTag);
        if (error) {
          console.error("Error updating order from webhook:", error);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
