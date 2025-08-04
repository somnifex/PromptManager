import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Grid,
  Alert,
  Chip,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

function SystemSettings() {
  const { t } = useTranslation();
  const timeoutRef = useRef(null);
  
  const [settings, setSettings] = useState({
    // 基础设置
    siteName: 'Prompt Management System',
    siteDescription: 'A powerful prompt management platform',
    maintenanceMode: false,
    allowRegistration: true,
    
    // 邮件设置
    emailEnabled: false,
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpTLS: true,
    
    // 安全设置
    sessionTimeout: 24,
    passwordMinLength: 8,
    requireStrongPassword: true,
    twoFactorEnabled: false,
    
    // 存储设置
    maxFileSize: 10,
    allowedFileTypes: 'txt,md,json',
    storageQuota: 1000,
    
    // 性能设置
    cacheEnabled: true,
    cacheTimeout: 3600,
    rateLimit: 1000,
    
    // 日志设置
    logLevel: 'INFO',
    logRetention: 30,
  });
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    email: false,
    security: false,
    storage: false,
    performance: false,
    logs: false,
  });

  useEffect(() => {
    fetchSettings();
    
    return () => {
      // 清理定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const fetchSettings = async () => {
    try {
      // 这里应该调用真实的API
      // const response = await fetch('/api/admin/settings/', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //   },
      // });
      // const data = await response.json();
      // setSettings(data);
      
      console.log('Fetching system settings...');
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      // 这里应该调用真实的API
      // const response = await fetch('/api/admin/settings/', {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(settings),
      // });
      
      console.log('Saving settings:', settings);
      
      setTimeout(() => {
        setLoading(false);
        setSaved(true);
        // 清理之前的定时器
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        // 设置新的定时器
        timeoutRef.current = setTimeout(() => setSaved(false), 3000);
      }, 1000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const SettingSection = ({ title, section, icon, children }) => (
    <Card sx={{ mb: 2, borderRadius: 2 }}>
      <CardHeader
        avatar={icon}
        title={title}
        action={
          <IconButton
            onClick={() => toggleSection(section)}
            aria-expanded={expandedSections[section]}
          >
            {expandedSections[section] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
        sx={{ cursor: 'pointer' }}
        onClick={() => toggleSection(section)}
      />
      <Collapse in={expandedSections[section]}>
        <CardContent sx={{ pt: 0 }}>
          <Divider sx={{ mb: 2 }} />
          {children}
        </CardContent>
      </Collapse>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t('admin.settings.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchSettings}
            variant="outlined"
            sx={{ borderRadius: '20px' }}
          >
            {t('admin.settings.refresh')}
          </Button>
          <Button
            startIcon={<SaveIcon />}
            onClick={saveSettings}
            variant="contained"
            loading={loading}
            sx={{ borderRadius: '20px' }}
          >
            {t('admin.settings.save')}
          </Button>
        </Box>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {t('admin.settings.saved')}
        </Alert>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 基础设置 */}
        <SettingSection
          title={t('admin.settings.basic.title')}
          section="basic"
          icon={<SecurityIcon color="primary" />}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('admin.settings.basic.siteName')}
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('admin.settings.basic.siteDescription')}
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                  />
                }
                label={t('admin.settings.basic.maintenanceMode')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.allowRegistration}
                    onChange={(e) => handleSettingChange('allowRegistration', e.target.checked)}
                  />
                }
                label={t('admin.settings.basic.allowRegistration')}
              />
            </Grid>
          </Grid>
        </SettingSection>

        {/* 邮件设置 */}
        <SettingSection
          title={t('admin.settings.email.title')}
          section="email"
          icon={<EmailIcon color="primary" />}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailEnabled}
                    onChange={(e) => handleSettingChange('emailEnabled', e.target.checked)}
                  />
                }
                label={t('admin.settings.email.enabled')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('admin.settings.email.smtpHost')}
                value={settings.smtpHost}
                onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
                fullWidth
                disabled={!settings.emailEnabled}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('admin.settings.email.smtpPort')}
                value={settings.smtpPort}
                onChange={(e) => handleSettingChange('smtpPort', parseInt(e.target.value) || 587)}
                type="number"
                fullWidth
                disabled={!settings.emailEnabled}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('admin.settings.email.smtpUser')}
                value={settings.smtpUser}
                onChange={(e) => handleSettingChange('smtpUser', e.target.value)}
                fullWidth
                disabled={!settings.emailEnabled}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('admin.settings.email.smtpPassword')}
                value={settings.smtpPassword}
                onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
                type="password"
                fullWidth
                disabled={!settings.emailEnabled}
              />
            </Grid>
          </Grid>
        </SettingSection>

        {/* 安全设置 */}
        <SettingSection
          title={t('admin.settings.security.title')}
          section="security"
          icon={<SecurityIcon color="primary" />}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('admin.settings.security.sessionTimeout')}
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value) || 24)}
                type="number"
                fullWidth
                InputProps={{
                  endAdornment: t('admin.settings.security.hours'),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('admin.settings.security.passwordMinLength')}
                value={settings.passwordMinLength}
                onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value) || 8)}
                type="number"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.requireStrongPassword}
                    onChange={(e) => handleSettingChange('requireStrongPassword', e.target.checked)}
                  />
                }
                label={t('admin.settings.security.requireStrongPassword')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onChange={(e) => handleSettingChange('twoFactorEnabled', e.target.checked)}
                  />
                }
                label={t('admin.settings.security.twoFactorEnabled')}
              />
            </Grid>
          </Grid>
        </SettingSection>

        {/* 存储设置 */}
        <SettingSection
          title={t('admin.settings.storage.title')}
          section="storage"
          icon={<StorageIcon color="primary" />}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('admin.settings.storage.maxFileSize')}
                value={settings.maxFileSize}
                onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value) || 10)}
                type="number"
                fullWidth
                InputProps={{
                  endAdornment: 'MB',
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('admin.settings.storage.storageQuota')}
                value={settings.storageQuota}
                onChange={(e) => handleSettingChange('storageQuota', parseInt(e.target.value) || 1000)}
                type="number"
                fullWidth
                InputProps={{
                  endAdornment: 'MB',
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('admin.settings.storage.allowedFileTypes')}
                value={settings.allowedFileTypes}
                onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value)}
                fullWidth
                helperText={t('admin.settings.storage.fileTypesHelp')}
              />
            </Grid>
          </Grid>
        </SettingSection>

        {/* 性能设置 */}
        <SettingSection
          title={t('admin.settings.performance.title')}
          section="performance"
          icon={<SpeedIcon color="primary" />}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.cacheEnabled}
                    onChange={(e) => handleSettingChange('cacheEnabled', e.target.checked)}
                  />
                }
                label={t('admin.settings.performance.cacheEnabled')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('admin.settings.performance.cacheTimeout')}
                value={settings.cacheTimeout}
                onChange={(e) => handleSettingChange('cacheTimeout', parseInt(e.target.value) || 3600)}
                type="number"
                fullWidth
                disabled={!settings.cacheEnabled}
                InputProps={{
                  endAdornment: t('admin.settings.performance.seconds'),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('admin.settings.performance.rateLimit')}
                value={settings.rateLimit}
                onChange={(e) => handleSettingChange('rateLimit', parseInt(e.target.value) || 1000)}
                type="number"
                fullWidth
                InputProps={{
                  endAdornment: t('admin.settings.performance.requestsPerHour'),
                }}
              />
            </Grid>
          </Grid>
        </SettingSection>
      </motion.div>
    </Box>
  );
}

export default SystemSettings;
