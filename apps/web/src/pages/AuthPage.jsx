import React, { useState } from 'react';
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { AlertCircle, CheckCircle2, ArrowLeft, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = (newMode) => {
    setMode(newMode);
    setEmail('');
    setPassword('');
    setUsername('');
    setError('');
    setSuccess('');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!username.trim()) {
          setError('Nama lengkap tidak boleh kosong.');
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Simpan username ke Firebase Realtime Database
        await set(ref(db, `users/${uid}/profile`), {
          username: username.trim(),
          email: email,
          createdAt: Date.now(),
        });

        await signOut(auth);
        switchMode('login');
        setSuccess('Akun berhasil dibuat! Silakan login menggunakan email tersebut.');

      } else if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        // App.jsx akan otomatis redirect ke dashboard

      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        setSuccess('Link reset password sudah dikirim ke Gmail kamu. Cek kotak masuk atau spam!');
        setEmail('');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email atau password salah!');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email ini sudah terdaftar!');
      } else if (err.code === 'auth/weak-password') {
        setError('Password minimal harus 6 karakter.');
      } else if (err.code === 'auth/missing-email') {
        setError('Masukkan email kamu terlebih dahulu.');
      } else {
        setError('Terjadi kesalahan sistem. Coba beberapa saat lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (mode === 'register') return 'Buat Akun Tandurai';
    if (mode === 'forgot') return 'Reset Password';
    return 'Masuk ke Dashboard';
  };

  const getDescription = () => {
    if (mode === 'register') return 'Daftar untuk mulai mengelola perangkat pertanian vertikal.';
    if (mode === 'forgot') return 'Masukkan email kamu untuk menerima link pemulihan password.';
    return 'Masukkan email dan password akun manajer lahan kamu.';
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Panel Kiri — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-emerald-800 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Background decorative */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Leaf size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight">Tandurai</span>
          </div>
          <p className="text-green-100 text-sm">Smart Vertical Farm System</p>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-black leading-tight">
            Kelola Kebun Vertikal<br />
            <span className="text-green-200">Lebih Cerdas</span>
          </h2>
          <p className="text-green-100 text-base leading-relaxed max-w-xs">
            Monitor suhu, kelembapan, CO₂, dan irigasi secara real-time dari mana saja. Didukung AI untuk rekomendasi otomatis.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Sensor Aktif', value: '12+' },
              { label: 'Akurasi Data', value: '99.8%' },
              { label: 'Uptime Sistem', value: '24/7' },
              { label: 'Respons Alert', value: '<5s' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-green-200 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-green-200 text-xs">
          © 2025 Tandurai Smart Farm. All rights reserved.
        </div>
      </div>

      {/* Panel Kanan — Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        {/* Logo mobile */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
            <Leaf size={16} className="text-white" />
          </div>
          <span className="text-xl font-black text-foreground">Tandurai</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft size={16} /> Kembali ke Login
              </button>
            )}
            <h1 className="text-2xl font-black text-foreground">{getTitle()}</h1>
            <p className="text-muted-foreground text-sm mt-1">{getDescription()}</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 p-3 text-sm rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-1.5">
                <Label htmlFor="username">Nama Lengkap</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Contoh: Alan Pratama"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-muted/50 border-border"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@farm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/50 border-border"
                required
              />
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      Lupa Password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted/50 border-border"
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white mt-2" disabled={loading}>
              {loading
                ? 'Memproses...'
                : mode === 'forgot'
                ? 'Kirim Link Reset'
                : mode === 'register'
                ? 'Daftar Sekarang'
                : 'Masuk Dashboard'}
            </Button>

            {mode !== 'forgot' && (
              <div className="text-center pt-2 text-sm text-muted-foreground">
                {mode === 'register' ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}
                  className="text-primary font-medium hover:underline"
                >
                  {mode === 'register' ? 'Login disini' : 'Daftar disini'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}