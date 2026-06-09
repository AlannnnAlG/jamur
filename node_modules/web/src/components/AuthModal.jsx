import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose(); // Tutup modal jika sukses
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error(err);
      // Translasi error bawaan firebase agar ramah dibaca
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email atau password salah, jir.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email ini sudah terdaftar!');
      } else if (err.code === 'auth/weak-password') {
        setError('Password minimal harus 6 karakter.');
      } else {
        setError('Terjadi kesalahan. Coba lagi nanti.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {isRegister ? 'Buat Akun Tandurai' : 'Masuk ke Dashboard'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isRegister ? 'Daftar untuk mulai mengelola perangkat pertanian vertikal.' : 'Masukkan email dan password akun manajer lahan kamu.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAuth} className="space-y-4 pt-2">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle size={18} />
              <span>{error}</span>
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

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
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

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? 'Memproses...' : isRegister ? 'Daftar Sekarang' : 'Masuk Dashboard'}
          </Button>

          <div className="text-center pt-2 text-sm text-muted-foreground">
            {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-primary font-medium hover:underline focus:outline-none"
            >
              {isRegister ? 'Login disini' : 'Daftar disini'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}