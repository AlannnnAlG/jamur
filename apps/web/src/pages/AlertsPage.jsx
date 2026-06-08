
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info,
  X,
  Filter,
  Thermometer,
  Droplets,
  Wind,
  Leaf,
  WifiOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const initialAlerts = [
  {
    id: 1,
    type: 'High Temperature',
    severity: 'critical',
    message: 'Temperature exceeded safe threshold of 32°C',
    device: 'Temperature Sensor #1',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    icon: Thermometer
  },
  {
    id: 2,
    type: 'Low Water Tank',
    severity: 'warning',
    message: 'Water tank level dropped below 25%',
    device: 'Water Level Sensor',
    timestamp: new Date(Date.now() - 14 * 60 * 1000),
    icon: Droplets
  },
  {
    id: 3,
    type: 'Device Offline',
    severity: 'critical',
    message: 'Ventilation Controller lost connection',
    device: 'Ventilation Controller',
    timestamp: new Date(Date.now() - 27 * 60 * 1000),
    icon: WifiOff
  },
  {
    id: 4,
    type: 'High Humidity',
    severity: 'warning',
    message: 'Humidity level reached 89%, above optimal range',
    device: 'Humidity Sensor #2',
    timestamp: new Date(Date.now() - 43 * 60 * 1000),
    icon: Droplets
  },
  {
    id: 5,
    type: 'Excessive CO₂',
    severity: 'warning',
    message: 'CO₂ concentration at 547 ppm, ventilation recommended',
    device: 'CO₂ Sensor',
    timestamp: new Date(Date.now() - 67 * 60 * 1000),
    icon: Wind
  },
  {
    id: 6,
    type: 'Poor Air Quality',
    severity: 'normal',
    message: 'Air quality index dropped to 87%',
    device: 'Air Quality Sensor',
    timestamp: new Date(Date.now() - 92 * 60 * 1000),
    icon: Leaf
  },
  {
    id: 7,
    type: 'Low Temperature',
    severity: 'warning',
    message: 'Temperature dropped to 21°C, below optimal range',
    device: 'Temperature Sensor #2',
    timestamp: new Date(Date.now() - 124 * 60 * 1000),
    icon: Thermometer
  },
  {
    id: 8,
    type: 'Low Humidity',
    severity: 'normal',
    message: 'Humidity at 68%, misting cycle initiated',
    device: 'Humidity Sensor #1',
    timestamp: new Date(Date.now() - 156 * 60 * 1000),
    icon: Droplets
  }
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [severityFilter, setSeverityFilter] = useState('all');

  const severityConfig = {
    critical: {
      icon: AlertTriangle,
      color: 'bg-red-500/10 text-red-600 border-red-500/20',
      badgeColor: 'bg-red-500'
    },
    warning: {
      icon: AlertCircle,
      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      badgeColor: 'bg-yellow-500'
    },
    normal: {
      icon: Info,
      color: 'bg-green-500/10 text-green-600 border-green-500/20',
      badgeColor: 'bg-green-500'
    }
  };

  const filteredAlerts = severityFilter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.severity === severityFilter);

  const handleDismiss = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    toast.success('Alert dismissed');
  };

  const getTimeAgo = (timestamp) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const normalCount = alerts.filter(a => a.severity === 'normal').length;

  return (
    <>
      <Helmet>
        <title>Alerts - Taandurai</title>
        <meta name="description" content="Monitor and manage system alerts and notifications" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Alert Center</h1>
            <p className="text-muted-foreground">Monitor system alerts and notifications</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40">
                <Filter size={16} className="mr-2" />
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alerts</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-red-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Critical Alerts</p>
                    <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
                  </div>
                  <AlertTriangle className="text-red-500" size={32} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-yellow-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Warnings</p>
                    <p className="text-3xl font-bold text-yellow-600">{warningCount}</p>
                  </div>
                  <AlertCircle className="text-yellow-500" size={32} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-green-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Normal</p>
                    <p className="text-3xl font-bold text-green-600">{normalCount}</p>
                  </div>
                  <Info className="text-green-500" size={32} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {severityFilter === 'all' ? 'All Alerts' : `${severityFilter.charAt(0).toUpperCase() + severityFilter.slice(1)} Alerts`}
              <span className="text-muted-foreground font-normal ml-2">
                ({filteredAlerts.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <Info className="mx-auto text-muted-foreground mb-4" size={48} />
                <p className="text-muted-foreground">No alerts to display</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map((alert, index) => {
                  const config = severityConfig[alert.severity];
                  const SeverityIcon = config.icon;
                  const DeviceIcon = alert.icon;

                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-start gap-4 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-all duration-200"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                        <SeverityIcon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{alert.type}</h3>
                            <Badge variant="outline" className={config.color}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDismiss(alert.id)}
                            className="transition-all duration-200 hover:scale-110"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DeviceIcon size={14} />
                            <span>{alert.device}</span>
                          </div>
                          <span>{getTimeAgo(alert.timestamp)}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
