import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Fungsi untuk berpindah mode tampilan sekaligus membersihkan input data
  const switchMode = (newMode) => {
    setMode(newMode);
    setEmail('');
    setPassword('');
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
        // 1. Buat akun baru di Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // 2. PAKSA SIGNOUT agar tidak langsung bypass masuk ke dalam dashboard
        await signOut(auth);
        
        // 3. Arahkan kembali ke login dengan notifikasi sukses
        switchMode('login');
        setSuccess('Akun berhasil dibuat!, Silakan login menggunakan email tersebut.');
        
      } else if (mode === 'login') {
        // Proses login biasa
        await signInWithEmailAndPassword(auth, email, password);
        onClose(); // Tutup modal jika sukses login
        switchMode('login'); // Reset data form
        
      } else if (mode === 'forgot') {
        // Proses kirim email reset password ke Gmail
        await sendPasswordResetEmail(auth, email);
        setSuccess('Link reset password sudah dikirim ke Gmail kamu. Cek kotak masuk atau spam!');
        setEmail('');
      }
    } catch (err) {
      console.error(err);
      // Penanganan pesan error Firebase agar lebih ramah dibaca
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

  // Logika pembantu kustomisasi teks judul berdasarkan mode aktif
  const getModalTitle = () => {
    if (mode === 'register') return 'Buat Akun Tandurai';
    if (mode === 'forgot') return 'Reset Password Akun';
    return 'Masuk ke Dashboard';
  };

  const getModalDescription = () => {
    if (mode === 'register') return 'Daftar untuk mulai mengelola perangkat pertanian vertikal.';
    if (mode === 'forgot') return 'Masukkan email kamu untuk menerima link pemulihan password dari Google.';
    return 'Masukkan email dan password akun manajer lahan kamu.';
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { onClose(); switchMode('login'); }}>
      <DialogContent className="sm:max-w-[400px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            {mode === 'forgot' && (
              <button 
                type="button" 
                onClick={() => switchMode('login')}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {getModalDescription()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAuth} className="space-y-4 pt-2">
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

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@farm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-muted/50 border-border text-foreground"
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
                    className="text-xs text-primary font-medium hover:underline focus:outline-none"
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
                className="bg-muted/50 border-border text-foreground"
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? 'Memproses...' : mode === 'forgot' ? 'Kirim Link Reset' : mode === 'register' ? 'Daftar Sekarang' : 'Masuk Dashboard'}
          </Button>

          {mode !== 'forgot' ? (
            <div className="text-center pt-2 text-sm text-muted-foreground">
              {mode === 'register' ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
              <button
                type="button"
                onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}
                className="text-primary font-medium hover:underline focus:outline-none"
              >
                {mode === 'register' ? 'Login disini' : 'Daftar disini'}
              </button>
            </div>
          ) : (
            <div className="text-center pt-2 text-sm">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-muted-foreground font-medium hover:text-foreground focus:outline-none transition-colors"
              >
                Kembali ke Login
              </button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}