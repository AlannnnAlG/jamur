import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Lightbulb, TrendingUp, Activity, Loader2 } from 'lucide-react';

// INTEGRASI FIREBASE REALTIME DATABASE
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase'; // Pastikan path config Firebase kamu sudah benar

export default function AnalyticsPage() {
  const [historyData, setHistoryData] = useState([]);
  const [timeframe, setTimeframe] = useState('daily');
  const [loading, setLoading] = useState(true);

  // STATE UNTUK SKOR ANALITIK DINAMIS
  const [scores, setScores] = useState({
    environmental: 0,
    efficiency: 0,
    automation: 0,
    resource: 0,
    stability: 0,
    reliability: 100, // Default system sehat
  });

  // STATE UNTUK GRAFIK ANALITIK
  const [chartData, setChartData] = useState({
    trends: [],
    performance: []
  });

  useEffect(() => {
    const historyRef = ref(db, 'tumbara/history');

    const unsubscribe = onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot.val();
        
        // Ubah objek Firebase ke Array
        const formattedList = Object.keys(rawData).map((key) => ({
          id: key,
          ...rawData[key]
        }));

        // Urutkan berdasarkan waktu terkuno ke terbaru untuk visualisasi grafik yang benar
        formattedList.sort((a, b) => a.timestamp - b.timestamp);
        setHistoryData(formattedList);

        // --- ALGORITMA LOGIKA ANALISIS DATA REAL ---
        const totalLog = formattedList.length;
        
        if (totalLog > 0) {
          // 1. Hitung Stabilitas Suhu (Makin dekat ke suhu ideal 28°C - 30°C, skor makin tinggi)
          const perfectTempCount = formattedList.filter(item => item.temperature >= 26 && item.temperature <= 31).length;
          const calculatedStability = Math.round((perfectTempCount / totalLog) * 100);

          // 2. Hitung Efisiensi Otomatisasi (Berapa kali spray/fan aktif meredam suhu tinggi)
          const activeActions = formattedList.filter(item => item.sprayStatus === true || item.sprayStatus === 'Active' || item.fanStatus === true || item.fanStatus === 'Active').length;
          const calculatedAutomation = activeActions > 0 ? Math.min(70 + Math.round((activeActions / totalLog) * 30), 98) : 85;

          // 3. Efisiensi Keseluruhan Lingkungan
          const calculatedEnv = Math.round((calculatedStability + calculatedAutomation) / 2);

          // 4. Resource Usage (Konsumsi Air/Listrik fiktif berdasarkan durasi relay aktif)
          const calculatedResource = Math.max(95 - Math.round((activeActions / totalLog) * 25), 65);

          setScores({
            environmental: calculatedEnv,
            efficiency: Math.round(calculatedEnv * 0.95),
            automation: calculatedAutomation,
            resource: calculatedResource,
            stability: calculatedStability,
            reliability: 99 // Jika database terhubung lancar
          });

          // --- PEMETAAN DATA UNTUK GRAFIK REAL ---
          // Grafik Area (Daily Trends) - Ambil 10 data terakhir untuk sampling tren jam-jam-an
          const targetTrends = formattedList.slice(-10).map(item => ({
            time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            temperature: item.temperature,
            humidity: item.humidity,
          }));

          // Grafik Batang (Weekly Performance) - Simulasi performa berdasarkan kumpulan data log
          const daysName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const targetPerformance = formattedList.slice(-7).map((item, idx) => ({
            day: daysName[new Date(item.timestamp).getDay()] || `Log ${idx + 1}`,
            efficiency: Math.round((item.airQuality || 90) * 0.9),
            stability: item.temperature >= 26 && item.temperature <= 31 ? 95 : 75,
          }));

          setChartData({
            trends: targetTrends,
            performance: targetPerformance
          });
        }
      } else {
        // Handle jika Firebase benar-benar kosong
        setScores({ environmental: 0, efficiency: 0, automation: 0, resource: 0, stability: 0, reliability: 0 });
        setChartData({ trends: [], performance: [] });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const ScoreCard = ({ title, score, trend }) => {
    const color = score >= 85 ? 'text-green-500' : score >= 70 ? 'text-yellow-500' : 'text-red-500';
    const strokeColor = score >= 85 ? 'hsl(var(--primary))' : score >= 70 ? '#eab308' : 'hsl(var(--destructive))';
    
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <div className="relative w-24 h-24 mb-4">
            <svg className="w-full h-full -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
              <circle 
                cx="48" cy="48" r="40" 
                stroke={strokeColor} 
                strokeWidth="8" fill="none" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 - (251.2 * score) / 100} 
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${color}`}>{loading ? '--' : score}</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground line-clamp-1">{title}</h3>
          <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
            <TrendingUp size={14} />
            <span>+{trend}%</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Helmet>
        <title>Analytics - Tumbara</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Deep insights into farm performance and efficiency from Firebase</p>
          </div>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily View</SelectItem>
              <SelectItem value="weekly">Weekly View</SelectItem>
              <SelectItem value="monthly">Monthly View</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Score Cards (Dihitung Real-time dari Log Firebase) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <ScoreCard title="Environmental Score" score={scores.environmental} trend={1.2} />
          <ScoreCard title="Farm Efficiency" score={scores.efficiency} trend={2.1} />
          <ScoreCard title="Automation Efficiency" score={scores.automation} trend={1.5} />
          <ScoreCard title="Resource Usage" score={scores.resource} trend={3.4} />
          <ScoreCard title="Stability Index" score={scores.stability} trend={2.2} />
          <ScoreCard title="System Reliability" score={scores.reliability} trend={0.1} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bagian Utama Grafik */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Environmental Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {loading ? (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground"><Loader2 className="animate-spin mr-2" /> Syncing with Firebase...</div>
                  ) : chartData.trends.length === 0 ? (
                    <div className="h-full w-full flex items-center justify-center border border-dashed rounded-lg text-sm text-muted-foreground">Belum ada data log untuk kalkulasi grafik mingguan.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.trends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                        <Area type="monotone" dataKey="temperature" name="Temp (°C)" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
                        <Area type="monotone" dataKey="humidity" name="Hum (%)" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary)/0.2)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  {loading ? (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground"><Loader2 className="animate-spin mr-2" /> Menghitung performa...</div>
                  ) : chartData.performance.length === 0 ? (
                    <div className="h-full w-full flex items-center justify-center border border-dashed rounded-lg text-sm text-muted-foreground">Belum ada data riwayat yang terekam di database.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.performance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                        <Bar dataKey="efficiency" name="Efficiency (%)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="stability" name="Stability (%)" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Insights */}
          <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Lightbulb size={20} />
                  Automatic Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-card rounded-lg border border-border shadow-sm">
                  <p className="text-sm font-medium">Sistem Sinkronisasi Aktif</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {historyData.length > 0 
                      ? `Berhasil membaca ${historyData.length} baris rekaman log untuk menganalisis performa otomatisasi kumbung jamur.`
                      : 'Menunggu perangkat keras menyetor log riwayat pertama ke Firebase.'}
                  </p>
                </div>
                <div className="p-3 bg-card rounded-lg border border-border shadow-sm">
                  <p className="text-sm font-medium">Target Suhu Optimal</p>
                  <p className="text-xs text-muted-foreground mt-1">Kalkulasi skor stabilitas disesuaikan otomatis dengan standar pertumbuhan kumbung Tumbara (26-31°C).</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity size={20} />
                  Comparisons Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Database Sync</span>
                  <span className={`text-sm font-medium ${historyData.length > 0 ? 'text-green-500' : 'text-yellow-500'}`}>
                    {historyData.length > 0 ? 'Connected' : 'No History Logs'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Total Logs Evaluated</span>
                  <span className="text-sm font-semibold">{historyData.length} data</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}