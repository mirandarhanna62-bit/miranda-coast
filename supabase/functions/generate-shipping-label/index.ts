import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LabelRequest {
  order_id: string;
  service_id?: number;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MELHOR_ENVIO_API_KEY = Deno.env.get("MELHOR_ENVIO_API_TOKEN") || Deno.env.get("MELHOR_ENVIO_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!MELHOR_ENVIO_API_KEY) {
      throw new Error("MELHOR_ENVIO_API_TOKEN not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { order_id, service_id }: LabelRequest = await req.json();

    console.log("Generating label for order:", order_id);

    // Fetch order data
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    const shippingAddress = order.shipping_address as any;
    const orderItems = order.order_items || [];
    // Tenta encontrar documento do destinatário em diferentes campos
    const recipientDocumentRaw =
      shippingAddress?.document ||
      shippingAddress?.cpf ||
      shippingAddress?.cnpj ||
      order?.customer_document ||
      order?.document ||
      order?.cpf ||
      order?.cnpj ||
      order?.payer_document ||
      order?.payment_document ||
      "";
    const recipientDocument = (recipientDocumentRaw || "").toString().replace(/\D/g, "");

    // Sender from env
    const sender = {
      name: Deno.env.get("MELHOR_ENVIO_SENDER_NAME") || "Remetente",
      phone: Deno.env.get("MELHOR_ENVIO_SENDER_PHONE") || "",
      email: Deno.env.get("MELHOR_ENVIO_SENDER_EMAIL") || "",
      document: Deno.env.get("MELHOR_ENVIO_SENDER_DOCUMENT") || "",
      address: Deno.env.get("MELHOR_ENVIO_SENDER_STREET") || "",
      number: Deno.env.get("MELHOR_ENVIO_SENDER_NUMBER") || "",
      complement: Deno.env.get("MELHOR_ENVIO_SENDER_COMPLEMENT") || "",
      district: Deno.env.get("MELHOR_ENVIO_SENDER_DISTRICT") || "",
      city: Deno.env.get("MELHOR_ENVIO_SENDER_CITY") || "",
      state_abbr: Deno.env.get("MELHOR_ENVIO_SENDER_STATE") || "",
      postal_code: (Deno.env.get("MELHOR_ENVIO_SENDER_POSTAL_CODE") || "").replace(/\D/g, ""),
  country: Deno.env.get("MELHOR_ENVIO_SENDER_COUNTRY") || "BR",
  company_document: Deno.env.get("MELHOR_ENVIO_SENDER_COMPANY_DOCUMENT") || "",
  state_register: Deno.env.get("MELHOR_ENVIO_SENDER_STATE_REGISTER") || "",
  economic_activity_code: Deno.env.get("MELHOR_ENVIO_SENDER_CNAE") || "",
};

    // Dimensions/peso padrão
    const defaultVolume = {
      length: 16,
      width: 11,
      height: 3,
      weight: 0.2,
    };
    const volumes = [
      {
        length: defaultVolume.length,
        width: defaultVolume.width,
        height: defaultVolume.height,
        weight: defaultVolume.weight,
        insurance_value: order.total || order.subtotal || 0,
      },
    ];

    const serviceToUse =
      service_id ||
      (order.shipping_service && (order.shipping_service as any).id) ||
      (order.shipping_service && (order.shipping_service as any).service_id);

    if (!serviceToUse) {
      throw new Error("Serviço de frete não encontrado no pedido");
    }
    if (!recipientDocument) {
      throw new Error("Documento do destinatário não encontrado no pedido/endereço");
    }

    // 1. Add item to cart
    const cartResponse = await fetch("https://www.melhorenvio.com.br/api/v2/me/cart", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MELHOR_ENVIO_API_KEY}`,
        "User-Agent": "Miranda Costa (contato@mirandacosta.com.br)"
      },
      body: JSON.stringify({
        service: serviceToUse,
        from: {
          name: sender.name,
          phone: sender.phone,
          email: sender.email,
          document: sender.document,
          company_document: sender.company_document,
          state_register: sender.state_register,
          economic_activity_code: sender.economic_activity_code,
          address: sender.address,
          number: sender.number,
          complement: sender.complement || "",
          district: sender.district,
          city: sender.city,
          state_abbr: sender.state_abbr,
          postal_code: sender.postal_code,
        },
        to: {
          name: shippingAddress.name || "Cliente",
          phone: shippingAddress.phone || "",
          email: shippingAddress.email || "",
          document: recipientDocument,
          address: shippingAddress.street,
          number: shippingAddress.number,
          complement: shippingAddress.complement || "",
          district: shippingAddress.neighborhood,
          city: shippingAddress.city,
          state_abbr: shippingAddress.state,
          postal_code: shippingAddress.cep.replace(/\D/g, ""),
          country_id: shippingAddress.country_id || "BR",
        },
        products: orderItems.map((item: any) => ({
          name: item.product_name || "Item",
          quantity: item.quantity || 1,
          unitary_value: item.price || 0,
        })),
        volumes,
        options: {
          insurance_value: order.total || order.subtotal || 0,
          receipt: false,
          own_hand: false,
          collect: false,
          platform: Deno.env.get("MELHOR_ENVIO_PLATFORM") || "Miranda Coast",
          tags: [
            {
              tag: (order_id || "").toString(),
              url: "",
            },
          ],
          reminder: `Pedido ${order_id}`,
        },
      }),
    });

    if (!cartResponse.ok) {
      const errorText = await cartResponse.text();
      console.error("Cart API error:", cartResponse.status, errorText);
      throw new Error(`Failed to add to cart: ${errorText}`);
    }

    const cartData = await cartResponse.json();
    console.log("Cart response:", cartData);

    const cartItemId = cartData.id;

    // 2. Checkout (pagar etiqueta)
    const checkoutResponse = await fetch("https://www.melhorenvio.com.br/api/v2/me/shipment/checkout", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MELHOR_ENVIO_API_KEY}`,
        "User-Agent": "Miranda Costa (contato@mirandacosta.com.br)"
      },
      body: JSON.stringify({
        orders: [cartItemId],
      }),
    });

    let checkoutData: any = null;
    if (!checkoutResponse.ok) {
      const errorText = await checkoutResponse.text();
      console.error("Checkout API error:", checkoutResponse.status, errorText);
      // Se saldo insuficiente ou outro erro, devolve rascunho para pagar no painel
      return new Response(
        JSON.stringify({
          success: false,
          draft: true,
          melhor_envio_id: cartItemId,
          message: "Checkout não concluído (provável saldo insuficiente). Pague/gerencie esta etiqueta no painel do Melhor Envio.",
          details: errorText,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    } else {
      checkoutData = await checkoutResponse.json();
      console.log("Checkout response:", checkoutData);
    }

    // 3. Generate label
    const generateResponse = await fetch("https://www.melhorenvio.com.br/api/v2/me/shipment/generate", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MELHOR_ENVIO_API_KEY}`,
        "User-Agent": "Miranda Costa (contato@mirandacosta.com.br)"
      },
      body: JSON.stringify({
        orders: [cartItemId],
      }),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error("Generate API error:", generateResponse.status, errorText);
      throw new Error(`Failed to generate label: ${errorText}`);
    }

    const generateData = await generateResponse.json();
    console.log("Generate response:", generateData);

    // 4. Print label (get PDF URL)
    const printResponse = await fetch(`https://www.melhorenvio.com.br/api/v2/me/shipment/print`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MELHOR_ENVIO_API_KEY}`,
        "User-Agent": "Miranda Costa (contato@mirandacosta.com.br)"
      },
      body: JSON.stringify({
        mode: "public",
        orders: [cartItemId],
      }),
    });

    if (!printResponse.ok) {
      const errorText = await printResponse.text();
      console.error("Print API error:", printResponse.status, errorText);
      throw new Error(`Failed to print label: ${errorText}`);
    }

    const printData = await printResponse.json();
    console.log("Print response:", printData);

    // 5. Get tracking code
    const trackingResponse = await fetch(`https://www.melhorenvio.com.br/api/v2/me/shipment/tracking`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MELHOR_ENVIO_API_KEY}`,
        "User-Agent": "Miranda Costa (contato@mirandacosta.com.br)"
      },
      body: JSON.stringify({
        orders: [cartItemId],
      }),
    });

    let trackingCode = null;
    if (trackingResponse.ok) {
      const trackingData = await trackingResponse.json();
      trackingCode = trackingData[cartItemId]?.tracking || null;
      console.log("Tracking code:", trackingCode);
    }

    // 6. Update order with tracking code
    if (trackingCode) {
      await supabase
        .from('orders')
        .update({ tracking_code: trackingCode, status: 'shipped' })
        .eq('id', order_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        label_url: printData.url,
        tracking_code: trackingCode,
        melhor_envio_id: cartItemId,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error generating label:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate label" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
