import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  Grid,
  Alert,
  TextField,
  IconButton,
  Tooltip,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Shield as PrivacyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

function UserSettings() {
  const { t, i18n } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const timeoutRef = useRef(null);
  
  const [settings, setSettings] = useState({
    // 通知设置
    emailNotifications: true,
    pushNotifications: false,
    promptUpdates: true,
    systemUpdates: false,
    
    // 隐私设置
    profilePublic: false,
    showEmail: false,
    allowIndexing: false,
    
    // 界面设置
    language: 'zh',
    theme: 'auto',
    compactMode: false,
    showPreview: true,
    
    // 安全设置
    twoFactorEnabled: false,
    sessionTimeout: 24,
    loginNotifications: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    notifications: true,
    privacy: false,
    interface: false,
    security: false,
  });
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchUserSettings();
    
    return () => {
      // 清理定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const fetchUserSettings = async () => {
    try {
      // 这里应该调用真实的API
      // const response = await fetch('/api/users/settings/', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //   },
      // });
      // const data = await response.json();
      // setSettings(data);
      
      console.log('Fetching user settings...');
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      // 这里应该调用真实的API
      // const response = await fetch('/api/users/settings/', {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(settings),
      // });
      
      console.log('Saving settings:', settings);
      
      // 更新语言设置
      if (settings.language !== i18n.language) {
        i18n.changeLanguage(settings.language);
      }
      
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

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert(t('settings.security.passwordMismatch'));
      return;
    }
    
    try {
      // 这里应该调用真实的API
      console.log('Changing password...');
      setPasswordDialog(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const SettingSection = ({ title, section, icon, children }) => (
    <Card sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent sx={{ pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            py: 1,
          }}
          onClick={() => toggleSection(section)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          {expandedSections[section] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
        <Collapse in={expandedSections[section]}>
          <Box sx={{ pt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            {children}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t('settings.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchUserSettings}
            variant="outlined"
            sx={{ borderRadius: '20px' }}
          >
            {t('settings.refresh')}
          </Button>
          <Button
            startIcon={<SaveIcon />}
            onClick={saveSettings}
            variant="contained"
            disabled={loading}
            sx={{ borderRadius: '20px' }}
          >
            {t('settings.save')}
          </Button>
        </Box>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {t('settings.saved')}
        </Alert>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 通知设置 */}
        <SettingSection
          title={t('settings.notifications.title')}
          section="notifications"
          icon={<NotificationsIcon color="primary" />}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  />
                }
                label={t('settings.notifications.email')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                  />
                }
                label={t('settings.notifications.push')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.promptUpdates}
                    onChange={(e) => handleSettingChange('promptUpdates', e.target.checked)}
                  />
                }
                label={t('settings.notifications.promptUpdates')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.systemUpdates}
                    onChange={(e) => handleSettingChange('systemUpdates', e.target.checked)}
                  />
                }
                label={t('settings.notifications.systemUpdates')}
              />
            </Grid>
          </Grid>
        </SettingSection>

        {/* 隐私设置 */}
        <SettingSection
          title={t('settings.privacy.title')}
          section="privacy"
          icon={<PrivacyIcon color="primary" />}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.profilePublic}
                    onChange={(e) => handleSettingChange('profilePublic', e.target.checked)}
                  />
                }
                label={t('settings.privacy.profilePublic')}
              />
              <Typography variant="caption" color="text.secondary" display="block">
                {t('settings.privacy.profilePublicHelp')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.showEmail}
                    onChange={(e) => handleSettingChange('showEmail', e.target.checked)}
                  />
                }
                label={t('settings.privacy.showEmail')}
              />
              <Typography variant="caption" color="text.secondary" display="block">
                {t('settings.privacy.showEmailHelp')}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.allowIndexing}
                    onChange={(e) => handleSettingChange('allowIndexing', e.target.checked)}
                  />
                }
                label={t('settings.privacy.allowIndexing')}
              />
              <Typography variant="caption" color="text.secondary" display="block">
                {t('settings.privacy.allowIndexingHelp')}
              </Typography>
            </Grid>
          </Grid>
        </SettingSection>

        {/* 界面设置 */}
        <SettingSection
          title={t('settings.interface.title')}
          section="interface"
          icon={<PaletteIcon color="primary" />}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('settings.interface.language')}</InputLabel>
                <Select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  label={t('settings.interface.language')}
                >
                  <MenuItem value="zh">中文</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('settings.interface.theme')}</InputLabel>
                <Select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  label={t('settings.interface.theme')}
                >
                  <MenuItem value="light">{t('settings.interface.themes.light')}</MenuItem>
                  <MenuItem value="dark">{t('settings.interface.themes.dark')}</MenuItem>
                  <MenuItem value="auto">{t('settings.interface.themes.auto')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.compactMode}
                    onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                  />
                }
                label={t('settings.interface.compactMode')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.showPreview}
                    onChange={(e) => handleSettingChange('showPreview', e.target.checked)}
                  />
                }
                label={t('settings.interface.showPreview')}
              />
            </Grid>
          </Grid>
        </SettingSection>

        {/* 安全设置 */}
        <SettingSection
          title={t('settings.security.title')}
          section="security"
          icon={<SecurityIcon color="primary" />}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {t('settings.security.password')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('settings.security.passwordHelp')}
                  </Typography>
                </Box>
                <Button
                  startIcon={<KeyIcon />}
                  onClick={() => setPasswordDialog(true)}
                  variant="outlined"
                >
                  {t('settings.security.changePassword')}
                </Button>
              </Box>
              <Divider />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onChange={(e) => handleSettingChange('twoFactorEnabled', e.target.checked)}
                  />
                }
                label={t('settings.security.twoFactor')}
              />
              <Typography variant="caption" color="text.secondary" display="block">
                {t('settings.security.twoFactorHelp')}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('settings.security.sessionTimeout')}</InputLabel>
                <Select
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                  label={t('settings.security.sessionTimeout')}
                >
                  <MenuItem value={1}>1 {t('settings.security.hour')}</MenuItem>
                  <MenuItem value={8}>8 {t('settings.security.hours')}</MenuItem>
                  <MenuItem value={24}>24 {t('settings.security.hours')}</MenuItem>
                  <MenuItem value={168}>7 {t('settings.security.days')}</MenuItem>
                  <MenuItem value={720}>30 {t('settings.security.days')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.loginNotifications}
                    onChange={(e) => handleSettingChange('loginNotifications', e.target.checked)}
                  />
                }
                label={t('settings.security.loginNotifications')}
              />
              <Typography variant="caption" color="text.secondary" display="block">
                {t('settings.security.loginNotificationsHelp')}
              </Typography>
            </Grid>
          </Grid>
        </SettingSection>
      </motion.div>

      {/* 修改密码对话框 */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('settings.security.changePassword')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={t('settings.security.currentPassword')}
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label={t('settings.security.newPassword')}
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label={t('settings.security.confirmPassword')}
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setPasswordDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="contained" onClick={handlePasswordChange}>
            {t('settings.security.changePassword')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserSettings;
