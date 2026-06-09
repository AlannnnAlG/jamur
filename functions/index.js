const functions = require("firebase-functions");
const admin     = require("firebase-admin");
const fetch     = require("node-fetch");

admin.initializeApp();

const TELEGRAM_TOKEN   = "";
const TELEGRAM_CHAT_ID = "123456789";

// ─────────────────────────────────────────────────────────────
// KONFIGURASI ANTI-SPAM
// Ubah nilai di sini sesuai kebutuhan kebun kamu
// ─────────────────────────────────────────────────────────────
const COOLDOWN_MINUTES = 10; // Notif yang sama tidak akan terkirim lagi dalam X menit
const COOLDOWN_MS      = COOLDOWN_MINUTES * 60 * 1000;

// Path di Firebase untuk menyimpan timestamp terakhir notif
// Struktur: tumbara/notif_cooldown/<key> = timestamp (ms)
const COOLDOWN_REF = "tumbara/notif_cooldown";

// ─────────────────────────────────────────────────────────────
// DEFINISI ALERT
// Tambah / ubah kondisi alert di sini
// ─────────────────────────────────────────────────────────────
function getAlerts(data) {
  const alerts = [];
  const temp    = data.temperature;
  const hum     = data.humidity;
  const co2     = data.co2;
  const airQ    = data.airQuality;
  const moist   = data.moisture;
  const water   = data.waterLevel;

  // ── Suhu ──
  if (temp !== undefined) {
    if (temp > 33) {
      alerts.push({
        key:   "temp_critical_high",
        level: "CRITICAL",
        emoji: "🔴",
        title: "Suhu Sangat Tinggi — Tanaman Terancam!",
        body:  `🌡️ Suhu: <b>${temp}°C</b> (batas aman: ≤33°C)\n💡 Segera aktifkan kipas ventilasi & mist spray.`,
      });
    } else if (temp > 30) {
      alerts.push({
        key:   "temp_warning_high",
        level: "WARNING",
        emoji: "🟡",
        title: "Suhu Di Atas Optimal",
        body:  `🌡️ Suhu: <b>${temp}°C</b> (optimal: 24–30°C)\n💡 Pertimbangkan menambah sirkulasi udara.`,
      });
    } else if (temp < 20) {
      alerts.push({
        key:   "temp_critical_low",
        level: "CRITICAL",
        emoji: "🔴",
        title: "Suhu Terlalu Rendah — Metabolisme Terhambat!",
        body:  `🌡️ Suhu: <b>${temp}°C</b> (batas aman: ≥20°C)\n💡 Aktifkan pemanas atau grow light segera.`,
      });
    } else if (temp < 24) {
      alerts.push({
        key:   "temp_warning_low",
        level: "WARNING",
        emoji: "🟡",
        title: "Suhu Sedikit Dingin",
        body:  `🌡️ Suhu: <b>${temp}°C</b> (optimal: 24–30°C)\n💡 Coba nyalakan grow light lebih lama.`,
      });
    }
  }

  // ── Kelembapan Udara ──
  if (hum !== undefined) {
    if (hum < 60) {
      alerts.push({
        key:   "hum_warning_low",
        level: "WARNING",
        emoji: "🟡",
        title: "Kelembapan Udara Terlalu Rendah",
        body:  `💧 Kelembapan: <b>${hum}%</b> (optimal: 70–85%)\n💡 Aktifkan mist spray untuk menaikkan kelembapan.`,
      });
    } else if (hum > 90) {
      alerts.push({
        key:   "hum_warning_high",
        level: "WARNING",
        emoji: "🟡",
        title: "Kelembapan Udara Terlalu Tinggi",
        body:  `💧 Kelembapan: <b>${hum}%</b> (optimal: 70–85%)\n💡 Tingkatkan sirkulasi udara, risiko jamur meningkat.`,
      });
    }
  }

  // ── CO₂ ──
  if (co2 !== undefined) {
    if (co2 > 800) {
      alerts.push({
        key:   "co2_critical",
        level: "CRITICAL",
        emoji: "🔴",
        title: "Kadar CO₂ Berbahaya!",
        body:  `🌬️ CO₂: <b>${co2} ppm</b> (batas aman: ≤800 ppm)\n💡 Buka ventilasi maksimal & aktifkan exhaust fan segera.`,
      });
    } else if (co2 > 600) {
      alerts.push({
        key:   "co2_warning",
        level: "WARNING",
        emoji: "🟡",
        title: "CO₂ Melampaui Batas Aman",
        body:  `🌬️ CO₂: <b>${co2} ppm</b> (optimal: 400–600 ppm)\n💡 Tingkatkan aliran udara segar ke dalam ruangan.`,
      });
    }
  }

  // ── Kualitas Udara ──
  if (airQ !== undefined) {
    if (airQ < 70) {
      alerts.push({
        key:   "airq_critical",
        level: "CRITICAL",
        emoji: "🔴",
        title: "Kualitas Udara Sangat Buruk!",
        body:  `🍃 Kualitas Udara: <b>${airQ}%</b> (batas aman: ≥70%)\n💡 Periksa filter udara & sumber polutan segera.`,
      });
    } else if (airQ < 90) {
      alerts.push({
        key:   "airq_warning",
        level: "WARNING",
        emoji: "🟡",
        title: "Kualitas Udara Perlu Perhatian",
        body:  `🍃 Kualitas Udara: <b>${airQ}%</b> (optimal: ≥90%)\n💡 Jadwalkan pembersihan filter udara.`,
      });
    }
  }

  // ── Kelembapan Media Tanam ──
  if (moist !== undefined) {
    if (moist < 45) {
      alerts.push({
        key:   "moist_critical_low",
        level: "CRITICAL",
        emoji: "🔴",
        title: "Media Tanam Sangat Kering — Akar Terancam!",
        body:  `🌱 Kelembapan Media: <b>${moist}%</b> (batas aman: ≥45%)\n💡 Aktifkan irigasi segera untuk mencegah kerusakan akar.`,
      });
    } else if (moist < 60) {
      alerts.push({
        key:   "moist_warning_low",
        level: "WARNING",
        emoji: "🟡",
        title: "Kelembapan Media Tanam Rendah",
        body:  `🌱 Kelembapan Media: <b>${moist}%</b> (optimal: 60–75%)\n💡 Jadwalkan siklus irigasi dalam 1–2 jam ke depan.`,
      });
    } else if (moist > 85) {
      alerts.push({
        key:   "moist_warning_high",
        level: "WARNING",
        emoji: "🟡",
        title: "Media Tanam Terlalu Lembap",
        body:  `🌱 Kelembapan Media: <b>${moist}%</b> (optimal: 60–75%)\n💡 Tunda irigasi & periksa drainase, risiko busuk akar.`,
      });
    }
  }

  // ── Level Air Tangki ──
  if (water !== undefined) {
    if (water < 20) {
      alerts.push({
        key:   "water_critical",
        level: "CRITICAL",
        emoji: "🔴",
        title: "Tangki Air Hampir Kosong!",
        body:  `🚰 Level Tangki: <b>${water}%</b> (batas aman: ≥20%)\n💡 Isi tangki sekarang sebelum irigasi terhenti total.`,
      });
    } else if (water < 40) {
      alerts.push({
        key:   "water_warning",
        level: "WARNING",
        emoji: "🟡",
        title: "Level Air Tangki Rendah",
        body:  `🚰 Level Tangki: <b>${water}%</b> (optimal: ≥50%)\n💡 Rencanakan pengisian tangki dalam 24 jam ke depan.`,
      });
    }
  }

  return alerts;
}

// ─────────────────────────────────────────────────────────────
// KIRIM PESAN TELEGRAM
// ─────────────────────────────────────────────────────────────
async function sendTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id:    TELEGRAM_CHAT_ID,
      text:       message,
      parse_mode: "HTML",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Telegram error:", err);
  }
}

// ─────────────────────────────────────────────────────────────
// FIREBASE CLOUD FUNCTION
// Trigger: setiap kali data tumbara/monitoring berubah
// ─────────────────────────────────────────────────────────────
exports.monitoringSensorAlert = functions.database
  .ref("tumbara/monitoring")
  .onWrite(async (change, context) => {
    const data = change.after.val();
    if (!data) return null;

    // Ambil semua alert yang relevan dari data sensor saat ini
    const alerts = getAlerts(data);
    if (alerts.length === 0) return null;

    // Ambil semua cooldown yang tersimpan di Firebase sekaligus (1 read)
    const cooldownSnap = await admin.database()
      .ref(COOLDOWN_REF)
      .once("value");
    const cooldowns = cooldownSnap.val() || {};

    const now          = Date.now();
    const toSend       = [];
    const cooldownUpdates = {};

    for (const alert of alerts) {
      const lastSent = cooldowns[alert.key] || 0;
      const elapsed  = now - lastSent;

      // Lewati jika masih dalam periode cooldown
      if (elapsed < COOLDOWN_MS) {
        const sisaMenit = Math.ceil((COOLDOWN_MS - elapsed) / 60000);
        console.log(
          `[SKIP] ${alert.key} — cooldown aktif, sisa ${sisaMenit} menit`
        );
        continue;
      }

      // Lolos cooldown → jadikan kandidat kirim
      toSend.push(alert);
      cooldownUpdates[alert.key] = now; // simpan timestamp baru
    }

    if (toSend.length === 0) return null;

    // Update semua cooldown sekaligus (1 write) sebelum kirim
    // agar kalau fungsi dipanggil ulang cepat tidak double-send
    await admin.database()
      .ref(COOLDOWN_REF)
      .update(cooldownUpdates);

    // Kirim pesan ke Telegram
    const nowStr = new Date().toLocaleString("id-ID", {
      timeZone:    "Asia/Jakarta",
      day:         "2-digit",
      month:       "long",
      year:        "numeric",
      hour:        "2-digit",
      minute:      "2-digit",
      second:      "2-digit",
    });

    for (const alert of toSend) {
      const message =
        `${alert.emoji} <b>[${alert.level}] ${alert.title}</b>\n\n` +
        `${alert.body}\n\n` +
        `📍 Tandurai Smart Farm — Sidoarjo\n` +
        `🕐 ${nowStr}`;

      await sendTelegram(message);
      console.log(`[SENT] ${alert.key}`);
    }

    return null;
  });

// ─────────────────────────────────────────────────────────────
// OPSIONAL: Reset cooldown otomatis tiap tengah malam
// Berguna agar kondisi yang sudah lama (>10 jam) tetap
// bisa kirim notif lagi di hari berikutnya
// ─────────────────────────────────────────────────────────────
exports.resetCooldownMidnight = functions.pubsub
  .schedule("0 0 * * *")        // setiap hari jam 00:00 WIB
  .timeZone("Asia/Jakarta")
  .onRun(async () => {
    await admin.database().ref(COOLDOWN_REF).remove();
    console.log("[RESET] Semua cooldown notifikasi direset.");
    return null;
  });