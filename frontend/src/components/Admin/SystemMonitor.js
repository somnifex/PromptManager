import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Speed as SpeedIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

function SystemMonitor() {
  const { t } = useTranslation();
  const [systemStatus, setSystemStatus] = useState({
    cpu: { usage: 0, cores: 0 },
    memory: { used: 0, total: 0, percentage: 0 },
    disk: { used: 0, total: 0, percentage: 0 },
    network: { inbound: 0, outbound: 0 },
    uptime: 0,
    processes: 0,
    loadAverage: [0, 0, 0],
  });
  
  const [recentLogs, setRecentLogs] = useState([
    { timestamp: '2024-08-04 10:30:15', level: 'INFO', message: 'User login successful' },
    { timestamp: '2024-08-04 10:29:45', level: 'INFO', message: 'New prompt created' },
    { timestamp: '2024-08-04 10:28:20', level: 'WARNING', message: 'High memory usage detected' },
    { timestamp: '2024-08-04 10:27:10', level: 'INFO', message: 'Cache cleared successfully' },
    { timestamp: '2024-08-04 10:25:30', level: 'ERROR', message: 'Failed to send email notification' },
  ]);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 30000); // 每30秒更新一次
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      // 这里应该调用真实的API
      // const response = await fetch('/api/admin/system-status/', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //   },
      // });
      // const data = await response.json();
      
      // 模拟数据
      setTimeout(() => {
        setSystemStatus({
          cpu: { usage: Math.random() * 100, cores: 8 },
          memory: { 
            used: 4.2, 
            total: 16, 
            percentage: (4.2 / 16) * 100 
          },
          disk: { 
            used: 45.6, 
            total: 120, 
            percentage: (45.6 / 120) * 100 
          },
          network: { 
            inbound: Math.random() * 1000, 
            outbound: Math.random() * 500 
          },
          uptime: 172800, // 2 days in seconds
          processes: 156,
          loadAverage: [0.8, 1.2, 1.5],
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (value, thresholds = { warning: 70, critical: 90 }) => {
    if (value >= thresholds.critical) return 'error';
    if (value >= thresholds.warning) return 'warning';
    return 'success';
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'ERROR': return 'error';
      case 'WARNING': return 'warning';
      case 'INFO': return 'info';
      case 'DEBUG': return 'default';
      default: return 'default';
    }
  };

  const systemCards = [
    {
      title: t('admin.monitor.cpu.title'),
      value: `${systemStatus.cpu.usage.toFixed(1)}%`,
      subtitle: t('admin.monitor.cpu.cores', { count: systemStatus.cpu.cores }),
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      progress: systemStatus.cpu.usage,
      color: getStatusColor(systemStatus.cpu.usage),
    },
    {
      title: t('admin.monitor.memory.title'),
      value: `${systemStatus.memory.used} GB`,
      subtitle: t('admin.monitor.memory.total', { total: systemStatus.memory.total }),
      icon: <MemoryIcon sx={{ fontSize: 40 }} />,
      progress: systemStatus.memory.percentage,
      color: getStatusColor(systemStatus.memory.percentage),
    },
    {
      title: t('admin.monitor.disk.title'),
      value: `${systemStatus.disk.used} GB`,
      subtitle: t('admin.monitor.disk.total', { total: systemStatus.disk.total }),
      icon: <StorageIcon sx={{ fontSize: 40 }} />,
      progress: systemStatus.disk.percentage,
      color: getStatusColor(systemStatus.disk.percentage),
    },
    {
      title: t('admin.monitor.network.title'),
      value: formatBytes(systemStatus.network.inbound * 1024),
      subtitle: t('admin.monitor.network.outbound', { 
        outbound: formatBytes(systemStatus.network.outbound * 1024) 
      }),
      icon: <NetworkIcon sx={{ fontSize: 40 }} />,
      progress: Math.min((systemStatus.network.inbound / 1000) * 100, 100),
      color: 'primary',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t('admin.monitor.title')}
        </Typography>
        <Tooltip title={t('admin.monitor.refresh')}>
          <IconButton onClick={fetchSystemStatus} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 系统状态卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {systemCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {card.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {card.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {card.subtitle}
                      </Typography>
                    </Box>
                    <Box sx={{ color: `${card.color}.main` }}>
                      {card.icon}
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={card.progress}
                    color={card.color}
                    sx={{ borderRadius: 1, height: 6 }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* 日志 */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {t('admin.monitor.logs.title')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('admin.monitor.logs.timestamp')}</TableCell>
                      <TableCell>{t('admin.monitor.logs.level')}</TableCell>
                      <TableCell>{t('admin.monitor.logs.message')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentLogs.map((log, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                          {log.timestamp}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.level}
                            color={getLogLevelColor(log.level)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{log.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SystemMonitor;
