import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import api from '../api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const token = searchParams.get('token');
  const uid = searchParams.get('uid');

  useEffect(() => {
    if (!token || !uid) {
      setError('无效的重置链接');
    }
  }, [token, uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('密码长度至少为8位');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.post('/users/reset-password/', {
        token,
        uid,
        new_password: newPassword
      });
      
      setMessage('密码重置成功！3秒后跳转到登录页面...');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || '重置失败，请重试';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!token || !uid) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            无效的重置链接
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            请检查您的邮件中的链接是否完整，或重新申请密码重置。
          </Typography>
          <Button variant="contained" onClick={() => navigate('/login')}>
            返回登录页面
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Paper
            elevation={12}
            sx={{
              p: 4,
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom textAlign="center">
              重置密码
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              请输入您的新密码
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {message && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="新密码"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                margin="normal"
                required
                disabled={loading}
                helperText="密码长度至少为8位"
              />
              
              <TextField
                fullWidth
                label="确认新密码"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                required
                disabled={loading}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, borderRadius: '12px', py: 1.5 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : '重置密码'}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                返回登录页面
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}

export default ResetPassword;
