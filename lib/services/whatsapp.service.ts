const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID!
const WA_ACCESS_TOKEN = process.env.WA_ACCESS_TOKEN!

// Delay helper
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Kirim satu pesan teks
async function sendSingleMessage(to: string, text: string): Promise<void> {
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
      text: { body: text },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`sendWhatsAppMessage failed: ${JSON.stringify(err)}`)
  }
}

// Kirim pesan — kalau ada \n\n, split jadi beberapa pesan dengan jeda
export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<void> {
  // Split berdasarkan double newline
  const parts = message
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  if (parts.length <= 1) {
    // Pesan tunggal, langsung kirim
    await sendSingleMessage(to, message)
    return
  }

  // Kirim tiap bagian dengan jeda 1.5 detik
  for (let i = 0; i < parts.length; i++) {
    if (i > 0) await delay(1500)
    await sendSingleMessage(to, parts[i])
  }
}