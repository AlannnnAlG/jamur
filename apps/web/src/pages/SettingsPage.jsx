import React, { useState, createContext, useContext } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, User, Bell, Sliders, Globe, Shield,
  ChevronRight, Check, LogOut, Eye, EyeOff,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

/* ─────────────────────────────────────────────────────────────────────
   TRANSLATIONS
───────────────────────────────────────────────────────────────────── */
const T = {
  id: {
    pageTitle: 'Pengaturan - Tandurai',
    heading: 'Pengaturan',
    subheading: 'Kelola preferensi farm dan konfigurasi sistem Anda',
    saveBtn: 'Simpan Perubahan',
    saving: 'Menyimpan…',
    saved: 'Tersimpan!',
    savedToast: 'Pengaturan berhasil disimpan',
    settings: 'Pengaturan',
    tabs: {
      general:       { label: 'Umum',          desc: 'Info farm & lokasi' },
      automation:    { label: 'Otomasi',        desc: 'Ambang & pemicu' },
      notifications: { label: 'Notifikasi',     desc: 'Peringatan & kanal' },
      account:       { label: 'Akun',           desc: 'Profil pengguna' },
      security:      { label: 'Keamanan',       desc: 'Kata sandi & akses' },
    },
    general: {
      farmIdentity: 'Identitas Farm',
      farmIdentityDesc: 'Informasi dasar tentang fasilitas Anda',
      farmName: 'Nama Farm',
      farmNameHint: 'Ditampilkan di seluruh dashboard dan laporan',
      farmType: 'Jenis Farm',
      farmTypeHint: 'Kategori tanaman utama',
      location: 'Lokasi',
      locationHint: 'Digunakan untuk korelasi cuaca',
      regional: 'Pengaturan Regional',
      regionalDesc: 'Preferensi lokal dan waktu',
      timezone: 'Zona Waktu',
      timezoneHint: 'Semua cap waktu menggunakan zona ini',
      language: 'Bahasa',
    },
    automation: {
      master: 'Kontrol Utama',
      masterDesc: 'Saklar otomasi global',
      masterEnable: 'Aktifkan Otomasi Utama',
      masterEnableHint: 'Saat mati, semua tindakan otomatis dijeda dan perangkat harus dikontrol secara manual',
      emergencyShutoff: 'Pemutusan Darurat Otomatis',
      emergencyShutoffHint: 'Segera matikan semua aktuator jika pembacaan sensor kritis',
      climate: 'Ambang Iklim',
      climateDesc: 'Nilai target yang memicu respons otomatis',
      targetHumidity: 'Target Kelembaban',
      targetHumidityHint: 'Pengabutan aktif di bawah nilai ini (%)',
      targetTemp: 'Target Suhu',
      targetTempHint: 'Suhu dasar untuk kondisi tumbuh (°C)',
      fanTrigger: 'Suhu Pemicu Kipas',
      fanTriggerHint: 'Kipas exhaust aktif di atas nilai ini (°C)',
      sprayDuration: 'Durasi Semprotan',
      sprayDurationHint: 'Berapa lama pengabutan berjalan per siklus (detik)',
      co2: 'Ambang CO₂',
      co2Hint: 'Ventilasi aktif di atas level ini (ppm)',
      schedules: 'Jadwal',
      schedulesDesc: 'Jendela otomasi berbasis waktu',
      activeHours: 'Jam Aktif',
      activeHoursHint: 'Otomasi hanya berjalan dalam jendela ini',
      to: 'hingga',
    },
    notifications: {
      channels: 'Kanal Peringatan',
      channelsDesc: 'Pilih cara Anda menerima notifikasi farm',
      emailAlerts: 'Peringatan Email',
      emailAlertsHint: 'Dikirim ke alamat peringatan terdaftar Anda',
      pushNotif: 'Notifikasi Push',
      pushNotifHint: 'Dikirim ke aplikasi mobile',
      criticalOnly: 'Hanya Peringatan Kritis',
      criticalOnlyHint: 'Sembunyikan notifikasi yang tidak mendesak',
      weeklySummary: 'Ringkasan Mingguan',
      weeklySummaryHint: 'Ringkasan aktivitas farm setiap Senin pukul 08.00',
      destinations: 'Tujuan Peringatan',
      destinationsDesc: 'Ke mana notifikasi dikirimkan',
      alertEmail: 'Email Peringatan',
      alertEmailHint: 'Alamat utama untuk semua notifikasi email',
      backupEmail: 'Email Cadangan',
      backupEmailHint: 'CC pada peringatan kritis saja',
      thresholds: 'Ambang Peringatan',
      thresholdsDesc: 'Kapan mengirim notifikasi kritis',
      tempAlert: 'Peringatan Suhu (°C)',
      tempAlertHint: 'Peringatan aktif jika suhu melebihi ini',
      humidAlert: 'Peringatan Kelembaban (%)',
      humidAlertHint: 'Peringatan aktif jika kelembaban turun di bawah ini',
    },
    account: {
      profile: 'Profil',
      profileDesc: 'Informasi akun pribadi Anda',
      fullName: 'Nama Lengkap',
      email: 'Alamat Email',
      emailHint: 'Digunakan untuk login dan notifikasi',
      role: 'Peran',
      roleName: 'Administrator Farm',
      preferences: 'Preferensi',
      preferencesDesc: 'Pengaturan UI dan tampilan',
      compactMode: 'Mode Ringkas',
      compactModeHint: 'Kurangi padding di kartu dashboard',
      liveIndicators: 'Tampilkan Indikator Live',
      liveIndicatorsHint: 'Animasi denyut pada sensor aktif',
    },
    security: {
      changePassword: 'Ubah Kata Sandi',
      changePasswordDesc: 'Perbarui kredensial login Anda',
      currentPassword: 'Kata Sandi Saat Ini',
      newPassword: 'Kata Sandi Baru',
      newPasswordHint: 'Minimal 8 karakter',
      confirmPassword: 'Konfirmasi Kata Sandi',
      access: 'Kontrol Akses',
      accessDesc: 'Keamanan sesi dan login',
      twoFactor: 'Autentikasi Dua Faktor',
      twoFactorHint: 'Wajibkan OTP pada setiap login',
      sessionTimeout: 'Batas Waktu Sesi',
      sessionTimeoutHint: 'Auto-logout setelah 30 menit tidak aktif',
      dangerZone: 'Zona Bahaya',
      dangerZoneDesc: 'Tindakan akun yang tidak dapat dibalik',
      signOutAllLabel: 'Keluar dari semua perangkat',
      signOutAllHint: 'Batalkan semua sesi aktif kecuali yang saat ini',
      signOutAllBtn: 'Keluar Semua',
    },
  },
  en: {
    pageTitle: 'Settings - Tandurai',
    heading: 'Settings',
    subheading: 'Manage your farm preferences and system configuration',
    saveBtn: 'Save Changes',
    saving: 'Saving…',
    saved: 'Saved!',
    savedToast: 'Settings saved successfully',
    settings: 'Settings',
    tabs: {
      general:       { label: 'General',       desc: 'Farm info & locale' },
      automation:    { label: 'Automation',     desc: 'Thresholds & triggers' },
      notifications: { label: 'Notifications', desc: 'Alerts & channels' },
      account:       { label: 'Account',        desc: 'Profile details' },
      security:      { label: 'Security',       desc: 'Password & access' },
    },
    general: {
      farmIdentity: 'Farm Identity',
      farmIdentityDesc: 'Basic information about your facility',
      farmName: 'Farm Name',
      farmNameHint: 'Displayed across dashboards and reports',
      farmType: 'Farm Type',
      farmTypeHint: 'Primary crop category',
      location: 'Location',
      locationHint: 'Used for weather correlation',
      regional: 'Regional Settings',
      regionalDesc: 'Locale and time preferences',
      timezone: 'Time Zone',
      timezoneHint: 'All timestamps use this zone',
      language: 'Language',
    },
    automation: {
      master: 'Master Control',
      masterDesc: 'Global automation switch',
      masterEnable: 'Enable Master Automation',
      masterEnableHint: 'When off, all automated actions are paused and devices must be controlled manually',
      emergencyShutoff: 'Emergency Auto-Shutoff',
      emergencyShutoffHint: 'Immediately cut all actuators if sensor readings go critical',
      climate: 'Climate Thresholds',
      climateDesc: 'Target values that trigger automated responses',
      targetHumidity: 'Target Humidity',
      targetHumidityHint: 'Misting activates below this value (%)',
      targetTemp: 'Target Temperature',
      targetTempHint: 'Baseline temp for growing conditions (°C)',
      fanTrigger: 'Fan Trigger Temp',
      fanTriggerHint: 'Exhaust fan activates above this value (°C)',
      sprayDuration: 'Spray Duration',
      sprayDurationHint: 'How long misting runs per cycle (seconds)',
      co2: 'CO₂ Threshold',
      co2Hint: 'Ventilation triggers above this level (ppm)',
      schedules: 'Schedules',
      schedulesDesc: 'Time-based automation windows',
      activeHours: 'Active Hours',
      activeHoursHint: 'Automation only runs within this window',
      to: 'to',
    },
    notifications: {
      channels: 'Alert Channels',
      channelsDesc: 'Choose how you want to receive farm notifications',
      emailAlerts: 'Email Alerts',
      emailAlertsHint: 'Sent to your registered alert address',
      pushNotif: 'Push Notifications',
      pushNotifHint: 'Delivered to the mobile app',
      criticalOnly: 'Critical Alerts Only',
      criticalOnlyHint: 'Suppress non-urgent notifications',
      weeklySummary: 'Weekly Summary',
      weeklySummaryHint: 'A digest of farm activity every Monday 08:00',
      destinations: 'Alert Destinations',
      destinationsDesc: 'Where notifications are delivered',
      alertEmail: 'Alert Email',
      alertEmailHint: 'Primary address for all email notifications',
      backupEmail: 'Backup Email',
      backupEmailHint: "CC'd on critical alerts only",
      thresholds: 'Alert Thresholds',
      thresholdsDesc: 'When to send critical notifications',
      tempAlert: 'Temp Alert (°C)',
      tempAlertHint: 'Alert fires if temperature exceeds this',
      humidAlert: 'Humidity Alert (%)',
      humidAlertHint: 'Alert fires if humidity drops below this',
    },
    account: {
      profile: 'Profile',
      profileDesc: 'Your personal account information',
      fullName: 'Full Name',
      email: 'Email Address',
      emailHint: 'Used for login and notifications',
      role: 'Role',
      roleName: 'Farm Administrator',
      preferences: 'Preferences',
      preferencesDesc: 'UI and display settings',
      compactMode: 'Compact Mode',
      compactModeHint: 'Reduce padding in dashboard cards',
      liveIndicators: 'Show Live Indicators',
      liveIndicatorsHint: 'Pulse animations on active sensors',
    },
    security: {
      changePassword: 'Change Password',
      changePasswordDesc: 'Update your login credentials',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      newPasswordHint: 'At least 8 characters',
      confirmPassword: 'Confirm Password',
      access: 'Access Control',
      accessDesc: 'Session and login security',
      twoFactor: 'Two-Factor Authentication',
      twoFactorHint: 'Require OTP on every login',
      sessionTimeout: 'Session Timeout',
      sessionTimeoutHint: 'Auto-logout after 30 minutes of inactivity',
      dangerZone: 'Danger Zone',
      dangerZoneDesc: 'Irreversible account actions',
      signOutAllLabel: 'Sign out of all devices',
      signOutAllHint: 'Revoke all active sessions except the current one',
      signOutAllBtn: 'Sign Out All',
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────
   CONTEXT
───────────────────────────────────────────────────────────────────── */
const LangCtx = createContext('id');
const FormCtx = createContext({});

const useLang = () => useContext(LangCtx);
const useForm = () => useContext(FormCtx);

/* ─────────────────────────────────────────────────────────────────────
   REUSABLE PRIMITIVES
───────────────────────────────────────────────────────────────────── */
function Field({ label, hint, children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 sm:gap-6 items-start py-5 border-b border-border last:border-0">
      <div className="pt-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{hint}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ToggleRow({ label, hint, formKey, badge }) {
  const { form, setField } = useForm();
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div className="flex-1 pr-8">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{label}</p>
          {badge && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{badge}</Badge>}
        </div>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <Switch
        checked={!!form[formKey]}
        onCheckedChange={(val) => setField(formKey, val)}
      />
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <div className="px-6 pb-6">{children}</div>
      </Card>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   TAB COMPONENTS
───────────────────────────────────────────────────────────────────── */
function GeneralTab() {
  const lang = useLang();
  const t = T[lang].general;
  const { form, setField } = useForm();

  return (
    <div className="space-y-5">
      <Section title={t.farmIdentity} description={t.farmIdentityDesc}>
        <Field label={t.farmName} hint={t.farmNameHint}>
          <Input
            value={form.farmName}
            onChange={(e) => setField('farmName', e.target.value)}
            className="max-w-sm"
          />
        </Field>
        <Field label={t.farmType} hint={t.farmTypeHint}>
          <Select value={form.farmType} onValueChange={(v) => setField('farmType', v)}>
            <SelectTrigger className="max-w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mushroom">🍄 {lang === 'id' ? 'Jamur' : 'Mushroom'}</SelectItem>
              <SelectItem value="vegetable">🥬 {lang === 'id' ? 'Sayuran' : 'Vegetable'}</SelectItem>
              <SelectItem value="herb">🌿 {lang === 'id' ? 'Herbal' : 'Herb'}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label={t.location} hint={t.locationHint}>
          <Input
            value={form.location}
            onChange={(e) => setField('location', e.target.value)}
            className="max-w-sm"
          />
        </Field>
      </Section>

      <Section title={t.regional} description={t.regionalDesc}>
        <Field label={t.timezone} hint={t.timezoneHint}>
          <Select value={form.timezone} onValueChange={(v) => setField('timezone', v)}>
            <SelectTrigger className="max-w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="wib">WIB (GMT+7) — Jakarta</SelectItem>
              <SelectItem value="wita">WITA (GMT+8) — Makassar</SelectItem>
              <SelectItem value="wit">WIT (GMT+9) — Jayapura</SelectItem>
              <SelectItem value="utc">UTC (GMT+0)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label={t.language}>
          <Select value={form.language} onValueChange={(v) => setField('language', v)}>
            <SelectTrigger className="max-w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="id">Bahasa Indonesia</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Section>
    </div>
  );
}

function AutomationTab() {
  const lang = useLang();
  const t = T[lang].automation;
  const { form, setField } = useForm();

  return (
    <div className="space-y-5">
      <Section title={t.master} description={t.masterDesc}>
        <ToggleRow label={t.masterEnable} hint={t.masterEnableHint} formKey="masterAutomation" badge="LIVE" />
        <ToggleRow label={t.emergencyShutoff} hint={t.emergencyShutoffHint} formKey="emergencyShutoff" />
      </Section>

      <Section title={t.climate} description={t.climateDesc}>
        {[
          { label: t.targetHumidity, hint: t.targetHumidityHint, key: 'targetHumidity' },
          { label: t.targetTemp,     hint: t.targetTempHint,     key: 'targetTemp' },
          { label: t.fanTrigger,     hint: t.fanTriggerHint,     key: 'fanTriggerTemp' },
          { label: t.sprayDuration,  hint: t.sprayDurationHint,  key: 'sprayDuration' },
          { label: t.co2,            hint: t.co2Hint,            key: 'co2Threshold' },
        ].map(({ label, hint, key }) => (
          <Field key={key} label={label} hint={hint}>
            <Input
              type="number"
              value={form[key]}
              onChange={(e) => setField(key, e.target.value)}
              className="max-w-[120px]"
            />
          </Field>
        ))}
      </Section>

      <Section title={t.schedules} description={t.schedulesDesc}>
        <Field label={t.activeHours} hint={t.activeHoursHint}>
          <div className="flex items-center gap-3">
            <Input
              type="time"
              value={form.activeFrom}
              onChange={(e) => setField('activeFrom', e.target.value)}
              className="w-[130px]"
            />
            <span className="text-muted-foreground text-sm">{t.to}</span>
            <Input
              type="time"
              value={form.activeTo}
              onChange={(e) => setField('activeTo', e.target.value)}
              className="w-[130px]"
            />
          </div>
        </Field>
      </Section>
    </div>
  );
}

function NotificationsTab() {
  const lang = useLang();
  const t = T[lang].notifications;
  const { form, setField } = useForm();

  return (
    <div className="space-y-5">
      <Section title={t.channels} description={t.channelsDesc}>
        <ToggleRow label={t.emailAlerts}    hint={t.emailAlertsHint}    formKey="notifEmail" />
        <ToggleRow label={t.pushNotif}      hint={t.pushNotifHint}      formKey="notifPush" />
        <ToggleRow label={t.criticalOnly}   hint={t.criticalOnlyHint}   formKey="notifCriticalOnly" />
        <ToggleRow label={t.weeklySummary}  hint={t.weeklySummaryHint}  formKey="notifWeekly" />
      </Section>

      <Section title={t.destinations} description={t.destinationsDesc}>
        <Field label={t.alertEmail} hint={t.alertEmailHint}>
          <Input
            type="email"
            value={form.alertEmail}
            onChange={(e) => setField('alertEmail', e.target.value)}
            className="max-w-sm"
          />
        </Field>
        <Field label={t.backupEmail} hint={t.backupEmailHint}>
          <Input
            type="email"
            value={form.backupEmail}
            onChange={(e) => setField('backupEmail', e.target.value)}
            placeholder="backup@example.com"
            className="max-w-sm"
          />
        </Field>
      </Section>

      <Section title={t.thresholds} description={t.thresholdsDesc}>
        <Field label={t.tempAlert} hint={t.tempAlertHint}>
          <Input
            type="number"
            value={form.tempAlertThreshold}
            onChange={(e) => setField('tempAlertThreshold', e.target.value)}
            className="max-w-[120px]"
          />
        </Field>
        <Field label={t.humidAlert} hint={t.humidAlertHint}>
          <Input
            type="number"
            value={form.humidAlertThreshold}
            onChange={(e) => setField('humidAlertThreshold', e.target.value)}
            className="max-w-[120px]"
          />
        </Field>
      </Section>
    </div>
  );
}

function AccountTab() {
  const lang = useLang();
  const t = T[lang].account;
  const { form, setField } = useForm();

  return (
    <div className="space-y-5">
      <Section title={t.profile} description={t.profileDesc}>
        <Field label={t.fullName}>
          <Input
            value={form.fullName}
            onChange={(e) => setField('fullName', e.target.value)}
            className="max-w-sm"
          />
        </Field>
        <Field label={t.email} hint={t.emailHint}>
          <Input
            type="email"
            value={form.accountEmail}
            onChange={(e) => setField('accountEmail', e.target.value)}
            className="max-w-sm"
          />
        </Field>
        <Field label={t.role}>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-primary/10 text-primary border-0 text-xs font-medium px-2 py-0.5">
              {t.roleName}
            </Badge>
          </div>
        </Field>
      </Section>

      <Section title={t.preferences} description={t.preferencesDesc}>
        <ToggleRow label={t.compactMode}     hint={t.compactModeHint}     formKey="compactMode" />
        <ToggleRow label={t.liveIndicators}  hint={t.liveIndicatorsHint}  formKey="liveIndicators" />
      </Section>
    </div>
  );
}

function SecurityTab() {
  const lang = useLang();
  const t = T[lang].security;
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="space-y-5">
      <Section title={t.changePassword} description={t.changePasswordDesc}>
        <Field label={t.currentPassword}>
          <div className="relative max-w-sm">
            <Input type={showPw ? 'text' : 'password'} placeholder="••••••••" className="pr-10" />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>
        <Field label={t.newPassword} hint={t.newPasswordHint}>
          <Input type="password" placeholder="••••••••" className="max-w-sm" />
        </Field>
        <Field label={t.confirmPassword}>
          <Input type="password" placeholder="••••••••" className="max-w-sm" />
        </Field>
      </Section>

      <Section title={t.access} description={t.accessDesc}>
        <ToggleRow label={t.twoFactor}      hint={t.twoFactorHint}      formKey="twoFactor"      badge="RECOMMENDED" />
        <ToggleRow label={t.sessionTimeout} hint={t.sessionTimeoutHint} formKey="sessionTimeout" />
      </Section>

      <Section title={t.dangerZone} description={t.dangerZoneDesc}>
        <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">{t.signOutAllLabel}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t.signOutAllHint}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 shrink-0"
          >
            <LogOut size={14} className="mr-1.5" />
            {t.signOutAllBtn}
          </Button>
        </div>
      </Section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   INITIAL FORM STATE
───────────────────────────────────────────────────────────────────── */
const INITIAL_FORM = {
  // General
  farmName: 'Tandurai Main Facility',
  farmType: 'mushroom',
  location: 'Surabaya, East Java',
  timezone: 'wib',
  language: 'id',
  // Automation
  masterAutomation: true,
  emergencyShutoff: true,
  targetHumidity: '80',
  targetTemp: '26',
  fanTriggerTemp: '30',
  sprayDuration: '45',
  co2Threshold: '1200',
  activeFrom: '06:00',
  activeTo: '22:00',
  // Notifications
  notifEmail: true,
  notifPush: true,
  notifCriticalOnly: false,
  notifWeekly: true,
  alertEmail: 'admin@tandurai.com',
  backupEmail: '',
  tempAlertThreshold: '35',
  humidAlertThreshold: '60',
  // Account
  fullName: 'Admin Tandurai',
  accountEmail: 'admin@tandurai.com',
  compactMode: false,
  liveIndicators: true,
  // Security
  twoFactor: false,
  sessionTimeout: true,
};

/* ─────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const [form, setForm]       = useState(INITIAL_FORM);
  const [saved, setSaved]     = useState(INITIAL_FORM);   // last-saved snapshot
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving]   = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Derived active language (follows form in real-time)
  const lang = form.language;
  const t    = T[lang];

  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // Detect if form differs from last save
  const isDirty = JSON.stringify(form) !== JSON.stringify(saved);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setSaved(form);           // commit current form as saved snapshot
      setIsSaving(false);
      setShowSaved(true);
      toast.success(t.savedToast);
      setTimeout(() => setShowSaved(false), 2500);
    }, 900);
  };

  const TABS = [
    { id: 'general',       icon: Globe,   ...t.tabs.general },
    { id: 'automation',    icon: Sliders, ...t.tabs.automation },
    { id: 'notifications', icon: Bell,    ...t.tabs.notifications },
    { id: 'account',       icon: User,    ...t.tabs.account },
    { id: 'security',      icon: Shield,  ...t.tabs.security },
  ];

  const TAB_CONTENT = {
    general:       <GeneralTab />,
    automation:    <AutomationTab />,
    notifications: <NotificationsTab />,
    account:       <AccountTab />,
    security:      <SecurityTab />,
  };

  const activeTabMeta = TABS.find(tb => tb.id === activeTab);

  return (
    <LangCtx.Provider value={lang}>
      <FormCtx.Provider value={{ form, setField }}>
        <Helmet><title>{t.pageTitle}</title></Helmet>

        <form onSubmit={handleSave} className="max-w-5xl mx-auto pb-24 space-y-6">

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t.heading}</h1>
              <p className="text-muted-foreground text-sm mt-1">{t.subheading}</p>
            </div>

            <Button
              type="submit"
              disabled={isSaving || !isDirty}
              className="w-full sm:w-auto min-w-[160px] transition-all"
            >
              <AnimatePresence mode="wait" initial={false}>
                {showSaved ? (
                  <motion.span key="saved" className="flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}>
                    <Check size={15} /> {t.saved}
                  </motion.span>
                ) : (
                  <motion.span key="save" className="flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}>
                    <Save size={15} />
                    {isSaving ? t.saving : t.saveBtn}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          {/* Unsaved indicator */}
          <AnimatePresence>
            {isDirty && !isSaving && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {lang === 'id' ? 'Ada perubahan yang belum disimpan' : 'You have unsaved changes'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Layout */}
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-start">

            {/* Sidebar */}
            <motion.nav
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="md:sticky md:top-6 space-y-1 rounded-xl border border-border/60 bg-card p-2 shadow-sm"
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
                      ${isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                      }
                    `}
                  >
                    <Icon size={16} className="shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-none truncate">{tab.label}</p>
                      <p className={`text-[11px] mt-0.5 truncate ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {tab.desc}
                      </p>
                    </div>
                    {isActive && <ChevronRight size={14} className="ml-auto shrink-0 opacity-60" />}
                  </button>
                );
              })}
            </motion.nav>

            {/* Content */}
            <div className="min-w-0">
              {/* Breadcrumb */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: 0.12 }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4"
              >
                <span>{t.settings}</span>
                <ChevronRight size={12} />
                <span className="text-foreground font-medium">{activeTabMeta?.label}</span>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  {TAB_CONTENT[activeTab]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </form>
      </FormCtx.Provider>
    </LangCtx.Provider>
  );
}
