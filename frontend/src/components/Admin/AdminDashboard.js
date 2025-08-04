import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import UserManagement from './UserManagement';
import SystemSettings from './SystemSettings';
import SystemMonitor from './SystemMonitor';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function AdminDashboard() {
  const { t } = useTranslation();
  const { token } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPrompts: 0,
    activeUsers: 0,
    systemHealth: 'good',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_BASE_URL}/users/admin/stats/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setStats({
        totalUsers: data.total_users || 0,
        totalPrompts: data.total_prompts || 0,
        activeUsers: data.active_users || 0,
        systemHealth: data.system_health || 'unknown',
      });
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      setError(error.message);
      // 设置默认值以防止界面崩溃
      setStats({
        totalUsers: 0,
        totalPrompts: 0,
        activeUsers: 0,
        systemHealth: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const statCards = [
    {
      title: t('admin.stats.totalUsers'),
      value: loading ? '...' : stats.totalUsers,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#2196f3',
      bgColor: 'rgba(33, 150, 243, 0.1)',
    },
    {
      title: t('admin.stats.totalPrompts'),
      value: loading ? '...' : stats.totalPrompts,
      icon: <StorageIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      bgColor: 'rgba(76, 175, 80, 0.1)',
    },
    {
      title: t('admin.stats.activeUsers'),
      value: loading ? '...' : stats.activeUsers,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      bgColor: 'rgba(255, 152, 0, 0.1)',
    },
    {
      title: t('admin.stats.systemHealth'),
      value: loading ? '...' : (
        stats.systemHealth === 'good' ? t('admin.stats.healthy') : 
        stats.systemHealth === 'error' ? t('admin.stats.error') :
        t('admin.stats.warning')
      ),
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      color: stats.systemHealth === 'good' ? '#4caf50' : 
             stats.systemHealth === 'error' ? '#f44336' : '#ff9800',
      bgColor: stats.systemHealth === 'good' ? 'rgba(76, 175, 80, 0.1)' :
               stats.systemHealth === 'error' ? 'rgba(244, 67, 54, 0.1)' :
               'rgba(255, 152, 0, 0.1)',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t('admin.title')}
        </Typography>
        <Tooltip title={t('admin.refresh')}>
          <IconButton onClick={fetchAdminStats} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t('admin.stats.fetchError')}: {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  background: card.bgColor,
                  border: `1px solid ${card.color}20`,
                  borderRadius: 2,
                  height: '100%',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: card.color, mb: 1 }}>
                        {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {card.title}
                      </Typography>
                    </Box>
                    <Box sx={{ color: card.color }}>
                      {card.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label={t('admin.tabs.users')}
            icon={<PeopleIcon />}
            iconPosition="start"
            sx={{ minHeight: 64, fontWeight: 600 }}
          />
          <Tab
            label={t('admin.tabs.system')}
            icon={<SettingsIcon />}
            iconPosition="start"
            sx={{ minHeight: 64, fontWeight: 600 }}
          />
          <Tab
            label={t('admin.tabs.monitor')}
            icon={<TrendingUpIcon />}
            iconPosition="start"
            sx={{ minHeight: 64, fontWeight: 600 }}
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <UserManagement />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <SystemSettings />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <SystemMonitor />
        </TabPanel>
      </Paper>
    </Box>
  );
}

export default AdminDashboard;
