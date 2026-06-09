import React, { useState, useEffect, useRef } from 'react';
import { Search, Sun, Moon, Bell, User, CloudRain, Wifi, WifiOff, LogIn, LogOut } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ref, onValue } from 'firebase/database';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // 👈 Tambahkan ini
import { db, auth } from '../firebase'; // 👈 Import auth dari firebase.js
import AuthModal from './AuthModal'; // 👈 Import AuthModal yang kita buat tadi

const TELEGRAM_TOKEN = "8881064843:AAEPi3Vs4q9yViUmN9bGqT3CEOkx4L6fBp0";
const TELEGRAM_CHAT_ID = "5385475869";

const sendTelegram = async (message) => {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });
  } catch (err) {
    console.error("Gagal kirim Telegram:", err);
  }
};

export default function TopNavbar() {
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationCount] = useState(3);
  const [liveData, setLiveData] = useState({ temperature: '--', humidity: '--' });
  const [isEspOnline, setIsEspOnline] = useState(false);
  const [lastSyncText, setLastSyncText] = useState('Never synced');

  // State Manajemen Autentikasi Baru
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const lastAlertRef = useRef({ temperature: null, humidity: null });

  // 0. Listener Status Login Firebase
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  // 1. Jam Digital
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Firebase Realtime Database Listener + Telegram Alert
  useEffect(() => {
    const monitoringRef = ref(db, 'tumbara/monitoring');

    const unsubscribe = onValue(monitoringRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("Data Firebase:", data);

        setLiveData({
          temperature: data.temperature ?? '--',
          humidity: data.humidity ?? '--',
        });

        const kini = new Date();
        setLastSyncText(`Synced ${kini.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);

        if (data.espStatus) {
          const selisihDetik = (Date.now() - data.espStatus) / 1000;
          setIsEspOnline(selisihDetik < 15);
        } else {
          setIsEspOnline(false);
        }

        const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

        // Cek Suhu
        if (data.temperature > 32 && lastAlertRef.current.temperature !== 'high') {
          lastAlertRef.current.temperature = 'high';
          await sendTelegram(`🔴 <b>CRITICAL - Suhu Tinggi</b>\n🌡️ Suhu: <b>${data.temperature}°C</b> (melebihi 32°C)\n📍 Sensor: Temperature Sensor\n🕐 ${now}`);
        } else if (data.temperature < 21 && lastAlertRef.current.temperature !== 'low') {
          lastAlertRef.current.temperature = 'low';
          await sendTelegram(`🟡 <b>WARNING - Suhu Rendah</b>\n🌡️ Suhu: <b>${data.temperature}°C</b> (di bawah 21°C)\n📍 Sensor: Temperature Sensor\n🕐 ${now}`);
        } else if (data.temperature >= 21 && data.temperature <= 32) {
          lastAlertRef.current.temperature = null;
        }

        // Cek Humidity
        if (data.humidity > 89 && lastAlertRef.current.humidity !== 'high') {
          lastAlertRef.current.humidity = 'high';
          await sendTelegram(`🟡 <b>WARNING - Kelembaban Tinggi</b>\n💧 Kelembaban: <b>${data.humidity}%</b> (di atas 89%)\n📍 Sensor: Humidity Sensor\n🕐 ${now}`);
        } else if (data.humidity < 68 && lastAlertRef.current.humidity !== 'low') {
          lastAlertRef.current.humidity = 'low';
          await sendTelegram(`🟡 <b>WARNING - Kelembaban Rendah</b>\n💧 Kelembaban: <b>${data.humidity}%</b> (di bawah 68%)\n📍 Sensor: Humidity Sensor\n🕐 ${now}`);
        } else if (data.humidity >= 68 && data.humidity <= 89) {
          lastAlertRef.current.humidity = null;
        }

      } else {
        setIsEspOnline(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. Interval cek ESP status
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const monitoringRef = ref(db, 'tumbara/monitoring');
      onValue(monitoringRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.espStatus) {
            const selisihDetik = (Date.now() - data.espStatus) / 1000;
            setIsEspOnline(selisihDetik < 15);
          }
        }
      }, { onlyOnce: true });
    }, 5000);

    return () => clearInterval(checkInterval);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Gagal Logout:", err);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border backdrop-blur-sm bg-card/95">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16 gap-4">

        {/* Bagian Kiri - Pencarian */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="search"
              placeholder="Search devices, sensors..."
              className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Bagian Kanan */}
        <div className="flex items-center gap-2 lg:gap-4">

          {/* Widget Suhu & Kelembaban */}
          <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
            <CloudRain className="text-primary" size={20} />
            <div className="text-sm">
              <div className="font-medium">{liveData.temperature}°C</div>
              <div className="text-xs text-muted-foreground">Hum: {liveData.humidity}%</div>
            </div>
          </div>

          {/* Last Sync */}
          <div className="hidden xl:flex items-center gap-2 text-sm text-muted-foreground">
            {isEspOnline ? <Wifi className="text-green-500" size={16} /> : <WifiOff className="text-muted-foreground" size={16} />}
            <span>{lastSyncText}</span>
          </div>

          {/* Toggle Tema */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="transition-all duration-200 hover:scale-105">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </Button>

          {/* Notifikasi */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative transition-all duration-200 hover:scale-105">
                <Bell size={20} />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground">
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">High temperature alert</p>
                  <p className="text-sm text-muted-foreground">Temperature exceeded 32°C</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profil Modifikasi Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className={`transition-all duration-200 hover:scale-105 ${user ? 'text-primary' : 'text-muted-foreground'}`}>
                <User size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                {user ? (
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground truncate">Farm Manager</span>
                    <span className="text-xs text-muted-foreground truncate font-normal">{user.email}</span>
                  </div>
                ) : (
                  'Guest Mode'
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {user ? (
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => setIsAuthModalOpen(true)} className="text-primary focus:text-primary cursor-pointer">
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Sign In / Register</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>

      {/* Render Dialog Modal Auth */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}