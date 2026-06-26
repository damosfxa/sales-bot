const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID!
const WA_ACCESS_TOKEN = process.env.WA_ACCESS_TOKEN!

// Kirim pesan teks ke nomor WA customer via Meta Cloud API
export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<void> {
  const url = `https://graph.facebook.com/v19.0/${WA_PHONE_NUMBER_ID}/messages`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WA_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`sendWhatsAppMessage failed: ${JSON.stringify(err)}`)
  }
}