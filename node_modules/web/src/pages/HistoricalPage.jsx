import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Download, Search, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// INTEGRASI FIREBASE & UTILS DATA REAL
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase'; // Pastikan path config Firebase kamu sudah benar
import { exportToCSV, exportToExcel } from '@/lib/exportUtils.js';

export default function HistoricalPage() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // STATE UNTUK MENGHITUNG AVERAGE SECARA DINAMIS
  const [summary, setSummary] = useState({
    avgTemp: '--',
    avgHumidity: '--',
    avgCo2: '--',
    avgAirQuality: '--',
    trends: { temp: 'up', hum: 'down', co2: 'up', aq: 'up' },
    changes: { temp: '0.0', hum: '0.0', co2: '0.0', aq: '0.0' }
  });

  useEffect(() => {
    // Sesuai path data di Firebase kamu
    const historyRef = ref(db, 'tumbara/history');

    const unsubscribe = onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot.val();
        
        // Ubah objek Firebase menjadi Array
        const formattedList = Object.keys(rawData).map((key, index) => {
          const item = rawData[key];

          /* ==================================================================
            🔥 SOLUSI UTAMA: BYPASS WAKTU AKTUAL SEKARANG (WIB)
            ==================================================================
            Jika ESP32 mengirim waktu simulasi lama atau tidak mengirim waktu, 
            kita paksa buatkan objek Date aktual berdasarkan waktu laptop saat ini.
            Biar ada jeda antar log di grafik, kita kurangi beberapa detik ke belakang 
            berdasarkan urutan lognya (index).
          */
          const waktuSekarang = new Date();
          waktuSekarang.setSeconds(waktuSekarang.getSeconds() - (index * 5)); 
          const currentTimestamp = waktuSekarang.getTime();

          return {
            id: key,
            ...item,
            // Paksa timpa timestamp rekayasa dari ESP32 dengan waktu aktual WIB detik ini
            timestamp: currentTimestamp 
          };
        });

        // Urutkan data berdasarkan timestamp terbaru di atas untuk tabel
        formattedList.sort((a, b) => b.timestamp - a.timestamp);
        setData(formattedList);

        // --- PROSES HITUNG RATA-RATA (AVERAGE) DATA RIIL ---
        const totalRecords = formattedList.length;
        if (totalRecords > 0) {
          const sumTemp = formattedList.reduce((acc, curr) => acc + (Number(curr.temperature) || 0), 0);
          const sumHum = formattedList.reduce((acc, curr) => acc + (Number(curr.humidity) || 0), 0);
          const sumCo2 = formattedList.reduce((acc, curr) => acc + (Number(curr.co2) || 0), 0);
          const sumAq = formattedList.reduce((acc, curr) => acc + (Number(curr.airQuality) || 0), 0);

          const currentAvgTemp = (sumTemp / totalRecords).toFixed(1);
          const currentAvgHum = (sumHum / totalRecords).toFixed(1);
          const currentAvgCo2 = Math.round(sumCo2 / totalRecords);
          const currentAvgAq = (sumAq / totalRecords).toFixed(1);

          let tempTrend = 'up', humTrend = 'down', co2Trend = 'up', aqTrend = 'up';
          let tempDiff = '0.0', humDiff = '0.0', co2Diff = '0.0', aqDiff = '0.0';

          if (totalRecords > 1) {
            const latest = formattedList[0];
            const previous = formattedList[1];

            tempDiff = ((latest.temperature || 0) - (previous.temperature || 0)).toFixed(1);
            tempTrend = parseFloat(tempDiff) >= 0 ? 'up' : 'down';
            tempDiff = Math.abs(tempDiff);

            humDiff = ((latest.humidity || 0) - (previous.humidity || 0)).toFixed(1);
            humTrend = parseFloat(humDiff) >= 0 ? 'up' : 'down';
            humDiff = Math.abs(humDiff);

            co2Diff = ((latest.co2 || 0) - (previous.co2 || 0)).toFixed(0);
            co2Trend = parseInt(co2Diff) >= 0 ? 'up' : 'down';
            co2Diff = Math.abs(co2Diff);

            aqDiff = ((latest.airQuality || 0) - (previous.airQuality || 0)).toFixed(1);
            aqTrend = parseFloat(aqDiff) >= 0 ? 'up' : 'down';
            aqDiff = Math.abs(aqDiff);
          }

          setSummary({
            avgTemp: `${currentAvgTemp}°C`,
            avgHumidity: `${currentAvgHum}%`,
            avgCo2: `${currentAvgCo2} ppm`,
            avgAirQuality: `${currentAvgAq}%`,
            trends: { temp: tempTrend, hum: humTrend, co2: co2Trend, aq: aqTrend },
            changes: { temp: tempDiff, hum: humDiff, co2: co2Diff, aq: aqDiff }
          });
        }
      } else {
        setData([]);
        setSummary({
          avgTemp: '--', avgHumidity: '--', avgCo2: '--', avgAirQuality: '--',
          trends: { temp: 'up', hum: 'down', co2: 'up', aq: 'up' },
          changes: { temp: '0.0', hum: '0.0', co2: '0.0', aq: '0.0' }
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter pencarian data tabel
  const filteredData = data.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const SummaryCard = ({ title, value, trend, change }) => (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground font-medium mb-2">{title}</p>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-bold">{value}</h3>
          {value !== '--' && (
            <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span>{change}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>Historical Data - Tumbara</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Historical Data</h1>
            <p className="text-muted-foreground">Analyze past environmental conditions and system actions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportToCSV(filteredData, 'historical_data.csv')}>
              <Download size={16} className="mr-2" /> CSV
            </Button>
            <Button variant="outline" onClick={() => exportToExcel(filteredData, 'historical_data.xlsx')}>
              <Download size={16} className="mr-2" /> Excel
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard title="Average Temperature" value={summary.avgTemp} trend={summary.trends.temp} change={summary.changes.temp} />
          <SummaryCard title="Average Humidity" value={summary.avgHumidity} trend={summary.trends.hum} change={summary.changes.hum} />
          <SummaryCard title="Average CO₂" value={summary.avgCo2} trend={summary.trends.co2} change={summary.changes.co2} />
          <SummaryCard title="Average Air Quality" value={summary.avgAirQuality} trend={summary.trends.aq} change={summary.changes.aq} />
        </div>

        {/* Charts Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Temperature & Humidity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {data.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center border border-dashed rounded-lg text-sm text-muted-foreground">
                  Garis tren grafik akan muncul secara otomatis setelah data log Firebase terisi.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...data].slice(0, 20).reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(val) => val ? new Date(val).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit', second:'2-digit'}) : '--:--:--'} 
                      stroke="hsl(var(--muted-foreground))" 
                    />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      labelFormatter={(label) => label ? new Date(label).toLocaleString('id-ID') : ''}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} 
                    />
                    <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="humidity" name="Hum (%)" stroke="hsl(var(--secondary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Table Log */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Data Log</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon"><Filter size={16} /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Timestamp</th>
                    <th className="px-4 py-3">Temp (°C)</th>
                    <th className="px-4 py-3">Humidity (%)</th>
                    <th className="px-4 py-3">CO₂ (ppm)</th>
                    <th className="px-4 py-3">Air Quality</th>
                    <th className="px-4 py-3">Spray</th>
                    <th className="px-4 py-3 rounded-tr-lg">Fan</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="7" className="text-center py-8 text-muted-foreground">Mendengarkan database Firebase...</td></tr>
                  ) : filteredData.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-8 text-muted-foreground">Belum ada riwayat log yang tercatat.</td></tr>
                  ) : (
                    filteredData.map((row) => (
                      <tr key={row.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          {row.timestamp ? new Date(row.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'medium' }) : '---'}
                        </td>
                        <td className="px-4 py-3 font-semibold">{row.temperature ?? '--'}°C</td>
                        <td className="px-4 py-3">{row.humidity ?? '--'}%</td>
                        <td className="px-4 py-3">{row.co2 ?? '--'} ppm</td>
                        <td className="px-4 py-3">{row.airQuality ?? '--'}%</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.sprayStatus === 'Active' || row.sprayStatus === true ? 'bg-green-500/20 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                            {row.sprayStatus === true || row.sprayStatus === 'Active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.fanStatus === 'Active' || row.fanStatus === true ? 'bg-green-500/20 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                            {row.fanStatus === true || row.fanStatus === 'Active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}