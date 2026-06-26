import { Lead, ProjectType } from "@/lib/types"

const XAI_API_KEY = process.env.XAI_API_KEY!
const XAI_BASE_URL = "https://api.x.ai/v1"

// System prompt utama bot sales
function buildSystemPrompt(lead: Lead): string {
  const leadContext = lead.project_type
    ? `Customer ini sudah menyebutkan tipe project: ${lead.project_type}.`
    : "Customer ini belum menyebutkan tipe project."

  return `Kamu adalah sales assistant untuk jasa coding Voxy. Tugasmu adalah ngobrol dengan calon customer, gali kebutuhan mereka, dan bantu mereka closing.

JASA YANG TERSEDIA:
- Web: landing page, company profile, toko online
- Bot: Telegram bot, WhatsApp bot, Discord bot
- Automation: script otomasi, pipeline data
- Skripsi: project skripsi S1/D3
- Full Stack: aplikasi web/mobile lengkap

CARA KERJA:
1. Sapa customer dengan ramah dan natural, jangan kaku
2. Tanya kebutuhan satu per satu, jangan dump semua pertanyaan sekaligus
3. Gali: tipe project, fitur yang diinginkan, deadline, referensi
4. Setelah cukup info, presentasikan estimasi harga
5. Bantu customer sampai mereka siap lanjut

ATURAN PENTING:
- Gunakan bahasa Indonesia yang santai dan natural
- Jangan gunakan emoji berlebihan
- Jangan sebut angka harga sebelum tahu minimal tipe project dan fitur utama
- Kalau customer keberatan harga, tawarkan scope yang lebih kecil dulu
- Jangan janji deadline yang terlalu spesifik, gunakan range
- Kalau customer mau lanjut/deal, bilang bahwa kamu akan teruskan ke tim dan minta nama mereka

KONTEKS CUSTOMER SAAT INI:
${leadContext}
${lead.name ? `Nama: ${lead.name}` : ""}
${lead.project_description ? `Deskripsi project: ${lead.project_description}` : ""}

Jawab hanya dalam bahasa Indonesia. Jangan keluar dari topik jasa coding.`
}

// Struktur respons bot
export interface BotResponse {
  message: string
  leadUpdates?: Partial<{
    name: string
    project_type: ProjectType
    project_description: string
    features: string[]
    deadline: string
    reference_url: string
    price_min: number
    price_max: number
    status: "new" | "negotiating" | "closed_won" | "closed_lost"
  }>
  shouldNotifyClosing?: boolean
  shouldNotifyNewLead?: boolean
}

// Generate respons dari Grok berdasarkan riwayat percakapan
export async function generateBotResponse(
  lead: Lead,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  userMessage: string
): Promise<BotResponse> {
  const messages = [
    ...conversationHistory,
    { role: "user" as const, content: userMessage },
  ]

  const systemPrompt = `${buildSystemPrompt(lead)}

PENTING: Balas selalu dalam format JSON berikut, tanpa markdown, tanpa backtick:
{
  "message": "pesan yang dikirim ke customer",
  "leadUpdates": {
    "name": "nama kalau customer sudah sebut",
    "project_type": "web|bot|automation|skripsi|fullstack atau null",
    "project_description": "deskripsi singkat project atau null",
    "features": ["fitur1", "fitur2"],
    "deadline": "deadline dalam bahasa natural atau null",
    "reference_url": "url referensi atau null",
    "price_min": 500000,
    "price_max": 900000,
    "status": "new|negotiating|closed_won|closed_lost"
  },
  "shouldNotifyClosing": false,
  "shouldNotifyNewLead": false
}

Isi leadUpdates hanya dengan field yang berubah di pesan ini. Kosongkan field yang tidak ada info barunya (gunakan null atau hapus field-nya).
Set shouldNotifyClosing ke true kalau customer bilang deal/setuju/lanjut.
Set shouldNotifyNewLead ke true hanya untuk pesan pertama customer.
Set status ke "negotiating" kalau customer mulai tanya harga atau nego.
Set status ke "closed_won" kalau customer deal.
Set status ke "closed_lost" kalau customer batalkan.`

  const res = await fetch(`${XAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${XAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-3-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1024,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Grok API error: ${JSON.stringify(err)}`)
  }

  const data = await res.json()
  const rawText = data.choices?.[0]?.message?.content ?? ""

  try {
    const parsed = JSON.parse(rawText) as BotResponse
    return parsed
  } catch {
    return { message: rawText }
  }
}