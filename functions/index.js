const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();

const TELEGRAM_TOKEN = "";
const TELEGRAM_CHAT_ID = "123456789";

async function sendTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML",
    }),
  });
}

exports.monitoringSensorAlert = functions.database
  .ref("tumbara/monitoring")
  .onWrite(async (change, context) => {
    const data = change.after.val();
    if (!data) return null;

    const messages = [];
    const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

    if (data.temperature > 32) {
      messages.push(
        `🔴 <b>CRITICAL - Suhu Tinggi</b>\n` +
        `🌡️ Suhu: <b>${data.temperature}°C</b> (melebihi 32°C)\n` +
        `📍 Sensor: Temperature Sensor\n🕐 ${now}`
      );
    } else if (data.temperature < 21) {
      messages.push(
        `🟡 <b>WARNING - Suhu Rendah</b>\n` +
        `🌡️ Suhu: <b>${data.temperature}°C</b> (di bawah 21°C)\n` +
        `📍 Sensor: Temperature Sensor\n🕐 ${now}`
      );
    }

    if (data.humidity > 89) {
      messages.push(
        `🟡 <b>WARNING - Kelembaban Tinggi</b>\n` +
        `💧 Kelembaban: <b>${data.humidity}%</b> (di atas 89%)\n` +
        `📍 Sensor: Humidity Sensor\n🕐 ${now}`
      );
    } else if (data.humidity < 68) {
      messages.push(
        `🟡 <b>WARNING - Kelembaban Rendah</b>\n` +
        `💧 Kelembaban: <b>${data.humidity}%</b> (di bawah 68%)\n` +
        `📍 Sensor: Humidity Sensor\n🕐 ${now}`
      );
    }

    for (const msg of messages) {
      await sendTelegram(msg);
    }

    return null;
  });