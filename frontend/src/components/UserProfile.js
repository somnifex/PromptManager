import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Grid,
  Chip,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  TrendingUp as TrendingUpIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

function UserProfile() {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const timeoutRef = useRef(null);
  
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    bio: '',
    avatar: '',
    created_at: '',
    last_login: '',
    role: 'user',
    is_verified: false,
  });
  const [stats, setStats] = useState({
    promptsCreated: 0,
    promptsShared: 0,
    storageUsed: 0,
    storageTotal: 1024, // MB
    loginCount: 0,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
    
    return () => {
      // 清理定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.role || 'user',
      }));
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      // 这里应该调用真实的API
      // const response = await fetch('/api/users/profile/', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //   },
      // });
      // const data = await response.json();
      // setProfile(data);
      
      // 模拟数据
      setProfile(prev => ({
        ...prev,
        bio: 'AI enthusiast and prompt engineer',
        created_at: '2024-01-15T10:30:00Z',
        last_login: '2024-08-04T09:15:00Z',
        is_verified: true,
      }));
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      // 这里应该调用真实的API
      // const response = await fetch('/api/users/stats/', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //   },
      // });
      // const data = await response.json();
      // setStats(data);
      
      // 模拟数据
      setStats({
        promptsCreated: 25,
        promptsShared: 12,
        storageUsed: 256,
        storageTotal: 1024,
        loginCount: 128,
      });
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const handleEditProfile = () => {
    setEditForm({
      first_name: profile.first_name,
      last_name: profile.last_name,
      bio: profile.bio,
    });
    setEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      // 这里应该调用真实的API
      // const response = await fetch('/api/users/profile/', {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(editForm),
      // });
      
      console.log('Updating profile:', editForm);
      
      setTimeout(() => {
        setProfile(prev => ({
          ...prev,
          ...editForm,
        }));
        setLoading(false);
        setEditDialogOpen(false);
        setUpdateSuccess(true);
        // 清理之前的定时器
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        // 设置新的定时器
        timeoutRef.current = setTimeout(() => setUpdateSuccess(false), 3000);
      }, 1000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const locale = t('common.locale');
      // 确保 locale 有效，如果未定义则使用默认值
      const validLocale = locale && locale !== 'common.locale' ? locale : 'zh-CN';
      return new Date(dateString).toLocaleDateString(validLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.warn('Date formatting error:', error);
      // 回退到简单的日期格式
      return new Date(dateString).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storagePercentage = (stats.storageUsed / stats.storageTotal) * 100;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        {t('profile.title')}
      </Typography>

      {updateSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {t('profile.updateSuccess')}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 个人信息卡片 */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ borderRadius: 2, textAlign: 'center', position: 'relative' }}>
              <CardContent sx={{ pt: 4 }}>
                <Tooltip title={t('profile.editProfile')}>
                  <IconButton
                    onClick={handleEditProfile}
                    sx={{ position: 'absolute', top: 16, right: 16 }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 2,
                    fontSize: '3rem',
                    backgroundColor: 'primary.main',
                  }}
                >
                  {profile.first_name?.[0] || profile.username?.[0]?.toUpperCase()}
                </Avatar>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {profile.first_name && profile.last_name 
                      ? `${profile.first_name} ${profile.last_name}`
                      : profile.username
                    }
                  </Typography>
                  {profile.is_verified && (
                    <Tooltip title={t('profile.verified')}>
                      <VerifiedIcon color="primary" sx={{ ml: 1 }} />
                    </Tooltip>
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  @{profile.username}
                </Typography>
                
                <Chip
                  icon={profile.role === 'admin' ? <SecurityIcon /> : <PersonIcon />}
                  label={t(`profile.roles.${profile.role}`)}
                  color={profile.role === 'admin' ? 'primary' : 'default'}
                  sx={{ mb: 2 }}
                />
                
                {profile.bio && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {profile.bio}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* 详细信息 */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* 基本信息 */}
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      {t('profile.basicInfo')}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <EmailIcon color="action" sx={{ mr: 2 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {t('profile.email')}
                            </Typography>
                            <Typography variant="body1">
                              {profile.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <CalendarIcon color="action" sx={{ mr: 2 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {t('profile.memberSince')}
                            </Typography>
                            <Typography variant="body1">
                              {profile.created_at ? formatDate(profile.created_at) : '-'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <CalendarIcon color="action" sx={{ mr: 2 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {t('profile.lastLogin')}
                            </Typography>
                            <Typography variant="body1">
                              {profile.last_login ? formatDate(profile.last_login) : '-'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* 统计信息 */}
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      {t('profile.statistics')}
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                            {stats.promptsCreated}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('profile.stats.promptsCreated')}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                            {stats.promptsShared}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('profile.stats.promptsShared')}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                            {stats.loginCount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('profile.stats.totalLogins')}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                            {formatBytes(stats.storageUsed * 1024 * 1024)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('profile.stats.storageUsed')}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* 存储使用情况 */}
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <StorageIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {t('profile.storage.title')}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('profile.storage.usage')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatBytes(stats.storageUsed * 1024 * 1024)} / {formatBytes(stats.storageTotal * 1024 * 1024)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={storagePercentage}
                        color={storagePercentage > 80 ? 'error' : storagePercentage > 60 ? 'warning' : 'primary'}
                        sx={{ borderRadius: 1, height: 8 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {storagePercentage.toFixed(1)}% {t('profile.storage.used')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* 编辑个人资料对话框 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('profile.editProfile')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={t('profile.firstName')}
              value={editForm.first_name}
              onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
              fullWidth
            />
            <TextField
              label={t('profile.lastName')}
              value={editForm.last_name}
              onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
              fullWidth
            />
            <TextField
              label={t('profile.bio')}
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              multiline
              rows={3}
              fullWidth
              placeholder={t('profile.bioPlaceholder')}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="contained" onClick={handleSaveProfile} disabled={loading}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserProfile;
