
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  Power, 
  Droplets, 
  Fan, 
  Waves, 
  Wind,
  Play,
  Square,
  Lightbulb,
  TrendingUp,
  Calendar,
  Leaf
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function AutomationPage() {
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [deviceStates, setDeviceStates] = useState({
    spray: false,
    fan: false,
    pump: false,
    humidifier: false
  });
  const [activityLog, setActivityLog] = useState([
    { action: 'Misting cycle completed', time: '2 minutes ago', type: 'spray' },
    { action: 'Fan activated', time: '14 minutes ago', type: 'fan' },
    { action: 'Water pump stopped', time: '27 minutes ago', type: 'pump' },
    { action: 'Humidifier started', time: '43 minutes ago', type: 'humidifier' },
    { action: 'Misting cycle started', time: '1 hour ago', type: 'spray' }
  ]);

  const [healthScore] = useState(87);
  const [harvestReadiness] = useState(73);

  const handleDeviceControl = (device, action, isCritical = false) => {
    if (isCritical) {
      setPendingAction({ device, action });
      setShowConfirmDialog(true);
    } else {
      executeAction(device, action);
    }
  };

  const executeAction = (device, action) => {
    const newState = action === 'start' || action === 'on';
    setDeviceStates(prev => ({ ...prev, [device]: newState }));
    
    const actionText = `${device.charAt(0).toUpperCase() + device.slice(1)} ${action === 'start' || action === 'on' ? 'activated' : 'stopped'}`;
    setActivityLog(prev => [
      { action: actionText, time: 'Just now', type: device },
      ...prev.slice(0, 4)
    ]);
    
    toast.success(actionText);
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const recommendations = [
    { 
      title: 'Humidity optimization needed', 
      description: 'Current humidity is below ideal range. Activate misting system.',
      priority: 'high',
      icon: Droplets
    },
    { 
      title: 'Temperature stable', 
      description: 'Environment temperature is within optimal range.',
      priority: 'low',
      icon: TrendingUp
    },
    { 
      title: 'Increase ventilation', 
      description: 'CO₂ levels rising. Consider activating ventilation fan.',
      priority: 'medium',
      icon: Wind
    }
  ];

  const priorityColors = {
    high: 'bg-red-500/10 text-red-600 border-red-500/20',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    low: 'bg-green-500/10 text-green-600 border-green-500/20'
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <>
      <Helmet>
        <title>Automation Control - Tumbara</title>
        <meta name="description" content="Manage automated systems and manual controls for your smart farm" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Automation Control</h1>
          <p className="text-muted-foreground">Manage automated systems and manual device controls</p>
        </div>

        {/* Automatic Misting System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="text-primary" size={24} />
                    Automatic Misting System
                  </CardTitle>
                  <CardDescription>Intelligent humidity control automation</CardDescription>
                </div>
                <Switch
                  checked={automationEnabled}
                  onCheckedChange={setAutomationEnabled}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Badge variant="outline" className={automationEnabled ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-gray-500/10 text-gray-600 border-gray-500/20'}>
                      {automationEnabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Last Activation</p>
                    <p className="font-medium">Today at 14:23</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Next Scheduled Activation</p>
                    <p className="font-medium">Today at 16:30</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Current Automation Rule</p>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm font-medium mb-2">Humidity-based trigger</p>
                      <p className="text-sm text-muted-foreground">
                        Activate misting when humidity drops below 75% for more than 5 minutes
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Automation Logic</p>
                    <p className="text-sm">
                      System monitors humidity levels continuously and activates misting cycles to maintain optimal growing conditions between 75-85% humidity.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Manual Control Center */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Power className="text-primary" size={24} />
                Manual Control Center
              </CardTitle>
              <CardDescription>Direct control of farm devices and systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Controls */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Droplets className="text-primary" size={20} />
                      <div>
                        <p className="font-medium">Spray System</p>
                        <p className="text-sm text-muted-foreground">
                          {deviceStates.spray ? 'Running' : 'Stopped'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={deviceStates.spray ? 'default' : 'outline'}
                        onClick={() => handleDeviceControl('spray', 'start', true)}
                        disabled={deviceStates.spray}
                        className="transition-all duration-200"
                      >
                        <Play size={16} className="mr-1" />
                        Start
                      </Button>
                      <Button
                        size="sm"
                        variant={!deviceStates.spray ? 'default' : 'outline'}
                        onClick={() => handleDeviceControl('spray', 'stop', true)}
                        disabled={!deviceStates.spray}
                        className="transition-all duration-200"
                      >
                        <Square size={16} className="mr-1" />
                        Stop
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Fan className="text-primary" size={20} />
                      <div>
                        <p className="font-medium">Ventilation Fan</p>
                        <p className="text-sm text-muted-foreground">
                          {deviceStates.fan ? 'Running' : 'Stopped'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={deviceStates.fan ? 'default' : 'outline'}
                        onClick={() => handleDeviceControl('fan', 'on')}
                        disabled={deviceStates.fan}
                        className="transition-all duration-200"
                      >
                        ON
                      </Button>
                      <Button
                        size="sm"
                        variant={!deviceStates.fan ? 'default' : 'outline'}
                        onClick={() => handleDeviceControl('fan', 'off')}
                        disabled={!deviceStates.fan}
                        className="transition-all duration-200"
                      >
                        OFF
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Waves className="text-primary" size={20} />
                      <div>
                        <p className="font-medium">Water Pump</p>
                        <p className="text-sm text-muted-foreground">
                          {deviceStates.pump ? 'Running' : 'Stopped'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={deviceStates.pump ? 'default' : 'outline'}
                        onClick={() => handleDeviceControl('pump', 'on', true)}
                        disabled={deviceStates.pump}
                        className="transition-all duration-200"
                      >
                        ON
                      </Button>
                      <Button
                        size="sm"
                        variant={!deviceStates.pump ? 'default' : 'outline'}
                        onClick={() => handleDeviceControl('pump', 'off', true)}
                        disabled={!deviceStates.pump}
                        className="transition-all duration-200"
                      >
                        OFF
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Wind className="text-primary" size={20} />
                      <div>
                        <p className="font-medium">Humidifier</p>
                        <p className="text-sm text-muted-foreground">
                          {deviceStates.humidifier ? 'Running' : 'Stopped'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={deviceStates.humidifier ? 'default' : 'outline'}
                        onClick={() => handleDeviceControl('humidifier', 'on')}
                        disabled={deviceStates.humidifier}
                        className="transition-all duration-200"
                      >
                        ON
                      </Button>
                      <Button
                        size="sm"
                        variant={!deviceStates.humidifier ? 'default' : 'outline'}
                        onClick={() => handleDeviceControl('humidifier', 'off')}
                        disabled={!deviceStates.humidifier}
                        className="transition-all duration-200"
                      >
                        OFF
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Activity Log */}
                <div>
                  <h3 className="font-semibold mb-3">Recent Activity</h3>
                  <div className="space-y-2">
                    {activityLog.map((log, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-muted-foreground">{log.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Recommendations & Scores */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="text-primary" size={24} />
                  AI Environment Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => {
                    const Icon = rec.icon;
                    return (
                      <div key={index} className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                        <Icon className="text-primary mt-1" size={20} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{rec.title}</p>
                            <Badge variant="outline" className={priorityColors[rec.priority]}>
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Scores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Environmental Health Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Environmental Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-4">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="hsl(var(--muted))"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="hsl(var(--primary))"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - healthScore / 100)}`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-3xl font-bold ${getScoreColor(healthScore)}`}>
                        {healthScore}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Overall environment health score
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Harvest Readiness */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Leaf className="text-primary" size={20} />
                  Harvest Readiness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Readiness</span>
                    <span className="text-2xl font-bold text-primary">{harvestReadiness}%</span>
                  </div>
                  <Progress value={harvestReadiness} className="h-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Estimated Harvest Date</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar size={16} />
                    June 24, 2026
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Growth Trend</p>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    <TrendingUp size={14} className="mr-1" />
                    On track
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {pendingAction?.action} the {pendingAction?.device}? This action will override automatic controls.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingAction && executeAction(pendingAction.device, pendingAction.action)}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
