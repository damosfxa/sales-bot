export type ProjectType = "web" | "bot" | "automation" | "skripsi" | "fullstack"
export type LeadStatus = "new" | "negotiating" | "closed_won" | "closed_lost"
export type ConversationRole = "user" | "assistant"
export type NotificationType = "new_lead" | "closing" | "follow_up"
export type NotificationStatus = "sent" | "failed"

export interface Lead {
  id: string
  wa_number: string
  name: string | null
  project_type: ProjectType | null
  project_description: string | null
  features: string[]
  deadline: string | null
  reference_url: string | null
  price_min: number | null
  price_max: number | null
  status: LeadStatus
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  lead_id: string
  role: ConversationRole
  content: string
  created_at: string
}

export interface PricingRule {
  id: string
  project_type: ProjectType
  base_price_min: number
  base_price_max: number
  complexity_multiplier: { low: number; medium: number; high: number }
  notes: string | null
  updated_at: string
}

export interface Notification {
  id: string
  lead_id: string
  type: NotificationType
  status: NotificationStatus
  sent_at: string
}

export const leads: Lead[] = [
  {
    id: "a1b2c3d4-0001-0001-0001-000000000001",
    wa_number: "6281234567890",
    name: "Budi Santoso",
    project_type: "web",
    project_description: "Website company profile untuk perusahaan konstruksi",
    features: ["halaman home", "halaman tentang kami", "portofolio proyek", "form kontak"],
    deadline: "akhir bulan ini",
    reference_url: null,
    price_min: 500000,
    price_max: 900000,
    status: "closed_won",
    created_at: "2026-06-25T06:30:00Z",
    updated_at: "2026-06-25T07:15:00Z",
  },
  {
    id: "a1b2c3d4-0002-0002-0002-000000000002",
    wa_number: "6289876543210",
    name: null,
    project_type: "bot",
    project_description: "Bot Telegram untuk sistem absensi karyawan",
    features: ["check in/out via bot", "rekap harian", "laporan mingguan ke admin"],
    deadline: "tidak urgent, 1 bulan oke",
    reference_url: null,
    price_min: 700000,
    price_max: 1400000,
    status: "negotiating",
    created_at: "2026-06-25T08:00:00Z",
    updated_at: "2026-06-25T08:45:00Z",
  },
  {
    id: "a1b2c3d4-0003-0003-0003-000000000003",
    wa_number: "6285555555555",
    name: null,
    project_type: null,
    project_description: null,
    features: [],
    deadline: null,
    reference_url: null,
    price_min: null,
    price_max: null,
    status: "new",
    created_at: "2026-06-25T09:00:00Z",
    updated_at: "2026-06-25T09:00:00Z",
  },
  {
    id: "a1b2c3d4-0004-0004-0004-000000000004",
    wa_number: "6281111111111",
    name: "Siti Rahayu",
    project_type: "skripsi",
    project_description: "Aplikasi pengelolaan keuangan untuk skripsi S1 Informatika",
    features: ["input transaksi", "laporan bulanan", "grafik pengeluaran", "export PDF"],
    deadline: "2 bulan lagi",
    reference_url: null,
    price_min: 700000,
    price_max: 1200000,
    status: "closed_lost",
    created_at: "2026-06-24T10:00:00Z",
    updated_at: "2026-06-24T14:00:00Z",
  },
  {
    id: "a1b2c3d4-0005-0005-0005-000000000005",
    wa_number: "6282222222222",
    name: "Rizky Pratama",
    project_type: "fullstack",
    project_description: "Platform marketplace jual beli produk lokal",
    features: ["autentikasi", "listing produk", "keranjang belanja", "payment gateway", "dashboard seller"],
    deadline: "3 bulan",
    reference_url: "https://tokopedia.com",
    price_min: 3000000,
    price_max: 5000000,
    status: "negotiating",
    created_at: "2026-06-25T10:00:00Z",
    updated_at: "2026-06-25T11:30:00Z",
  },
]

export const conversations: Conversation[] = [
  {
    id: "conv-0001",
    lead_id: "a1b2c3d4-0001-0001-0001-000000000001",
    role: "user",
    content: "halo kak, mau tanya soal jasa web",
    created_at: "2026-06-25T06:30:00Z",
  },
  {
    id: "conv-0002",
    lead_id: "a1b2c3d4-0001-0001-0001-000000000001",
    role: "assistant",
    content: "Halo! Saya bisa bantu. Kira-kira project webnya untuk apa dulu kak?",
    created_at: "2026-06-25T06:30:05Z",
  },
  {
    id: "conv-0003",
    lead_id: "a1b2c3d4-0001-0001-0001-000000000001",
    role: "user",
    content: "buat company profile perusahaan konstruksi",
    created_at: "2026-06-25T06:31:00Z",
  },
  {
    id: "conv-0004",
    lead_id: "a1b2c3d4-0001-0001-0001-000000000001",
    role: "assistant",
    content: "Oke, company profile. Kira-kira halaman apa aja yang dibutuhkan? Misal: home, tentang kami, portofolio, kontak?",
    created_at: "2026-06-25T06:31:05Z",
  },
  {
    id: "conv-0005",
    lead_id: "a1b2c3d4-0001-0001-0001-000000000001",
    role: "user",
    content: "iya semua itu ada, sama halaman proyek yang sudah dikerjakan",
    created_at: "2026-06-25T06:32:00Z",
  },
  {
    id: "conv-0006",
    lead_id: "a1b2c3d4-0001-0001-0001-000000000001",
    role: "assistant",
    content: "Siap. Deadline-nya kira-kira kapan kak?",
    created_at: "2026-06-25T06:32:05Z",
  },
  {
    id: "conv-0007",
    lead_id: "a1b2c3d4-0001-0001-0001-000000000001",
    role: "user",
    content: "akhir bulan ini bisa?",
    created_at: "2026-06-25T06:33:00Z",
  },
  {
    id: "conv-0008",
    lead_id: "a1b2c3d4-0001-0001-0001-000000000001",
    role: "assistant",
    content: "Bisa. Untuk project seperti ini estimasinya sekitar Rp 500rb sampai 900rb tergantung detail finalnya. Tertarik lanjut?",
    created_at: "2026-06-25T06:33:10Z",
  },
  {
    id: "conv-0009",
    lead_id: "a1b2c3d4-0001-0001-0001-000000000001",
    role: "user",
    content: "oke deal kak, lanjut aja",
    created_at: "2026-06-25T06:34:00Z",
  },
  {
    id: "conv-0010",
    lead_id: "a1b2c3d4-0002-0002-0002-000000000002",
    role: "user",
    content: "kak bisa bikin bot telegram buat absensi?",
    created_at: "2026-06-25T08:00:00Z",
  },
  {
    id: "conv-0011",
    lead_id: "a1b2c3d4-0002-0002-0002-000000000002",
    role: "assistant",
    content: "Bisa. Fitur yang dibutuhkan apa aja? Check in/out, rekap, laporan?",
    created_at: "2026-06-25T08:00:05Z",
  },
  {
    id: "conv-0012",
    lead_id: "a1b2c3d4-0002-0002-0002-000000000002",
    role: "user",
    content: "iya ketiga-tiganya, sama ada notif ke admin tiap hari",
    created_at: "2026-06-25T08:01:00Z",
  },
  {
    id: "conv-0013",
    lead_id: "a1b2c3d4-0002-0002-0002-000000000002",
    role: "assistant",
    content: "Oke lengkap. Estimasinya Rp 700rb sampai 1.4jt. Deadline-nya gimana?",
    created_at: "2026-06-25T08:01:10Z",
  },
  {
    id: "conv-0014",
    lead_id: "a1b2c3d4-0002-0002-0002-000000000002",
    role: "user",
    content: "harga bisa kurang ga kak? budget saya 500rb",
    created_at: "2026-06-25T08:02:00Z",
  },
  {
    id: "conv-0015",
    lead_id: "a1b2c3d4-0002-0002-0002-000000000002",
    role: "assistant",
    content: "Untuk fitur selengkap itu agak susah di 500rb kak. Kalau mau, kita bisa kurangin dulu ke check in/out dan rekap harian aja, notif bisa ditambah nanti. Gimana?",
    created_at: "2026-06-25T08:02:10Z",
  },
]

export const pricingRules: PricingRule[] = [
  {
    id: "price-0001",
    project_type: "web",
    base_price_min: 300000,
    base_price_max: 1500000,
    complexity_multiplier: { low: 1.0, medium: 1.4, high: 1.8 },
    notes: "Landing page sampai company profile",
    updated_at: "2026-06-25T06:00:00Z",
  },
  {
    id: "price-0002",
    project_type: "bot",
    base_price_min: 500000,
    base_price_max: 2000000,
    complexity_multiplier: { low: 1.0, medium: 1.4, high: 1.8 },
    notes: "Telegram, WA, Discord bot",
    updated_at: "2026-06-25T06:00:00Z",
  },
  {
    id: "price-0003",
    project_type: "automation",
    base_price_min: 300000,
    base_price_max: 1500000,
    complexity_multiplier: { low: 1.0, medium: 1.4, high: 1.8 },
    notes: "Script dan pipeline automation",
    updated_at: "2026-06-25T06:00:00Z",
  },
  {
    id: "price-0004",
    project_type: "skripsi",
    base_price_min: 500000,
    base_price_max: 2500000,
    complexity_multiplier: { low: 1.0, medium: 1.4, high: 1.8 },
    notes: "Project skripsi S1/D3",
    updated_at: "2026-06-25T06:00:00Z",
  },
  {
    id: "price-0005",
    project_type: "fullstack",
    base_price_min: 1500000,
    base_price_max: 5000000,
    complexity_multiplier: { low: 1.0, medium: 1.4, high: 1.8 },
    notes: "Aplikasi fullstack lengkap",
    updated_at: "2026-06-25T06:00:00Z",
  },
]

export const notifications: Notification[] = [
  {
    id: "notif-0001",
    lead_id: "a1b2c3d4-0001-0001-0001-000000000001",
    type: "closing",
    status: "sent",
    sent_at: "2026-06-25T07:15:00Z",
  },
  {
    id: "notif-0002",
    lead_id: "a1b2c3d4-0003-0003-0003-000000000003",
    type: "new_lead",
    status: "sent",
    sent_at: "2026-06-25T09:00:05Z",
  },
  {
    id: "notif-0003",
    lead_id: "a1b2c3d4-0005-0005-0005-000000000005",
    type: "new_lead",
    status: "sent",
    sent_at: "2026-06-25T10:00:05Z",
  },
]

// helpers
export function formatRupiah(amount: number): string {
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1).replace(".0", "")}jt`
  if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(0)}rb`
  return `Rp ${amount}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const statusLabel: Record<LeadStatus, string> = {
  new: "Baru",
  negotiating: "Nego",
  closed_won: "Deal",
  closed_lost: "Batal",
}

export const projectTypeLabel: Record<ProjectType, string> = {
  web: "Web",
  bot: "Bot",
  automation: "Automation",
  skripsi: "Skripsi",
  fullstack: "Full Stack",
}