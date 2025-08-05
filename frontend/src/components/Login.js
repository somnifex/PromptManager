import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { login, register } from '../slices/authSlice';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Divider,
  Link,
  Stack,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Language as LanguageIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  VpnKey as TwoFactorIcon,
} from '@mui/icons-material';
import api from '../api';
import { setCredentials } from '../slices/authSlice';

function Login() {
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    role: 'user' 
  });
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [userId, setUserId] = useState(null);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { isLoading, error } = useSelector((state) => state.auth);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/users/login/', loginForm);
      if (response.data.two_factor_required) {
        setTwoFactorRequired(true);
        setUserId(response.data.user_id);
      } else {
        dispatch(setCredentials(response.data));
        navigate('/');
      }
    } catch (err) {
      console.error('Login failed:', err);
      // 这里可以处理登录失败的UI反馈
    }
  };

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/users/two-factor/verify/', {
        user_id: userId,
        code: twoFactorCode,
      });
      dispatch(setCredentials(response.data));
      navigate('/');
    } catch (err) {
      console.error('2FA verification failed:', err);
      // 这里可以处理2FA验证失败的UI反馈
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // 检查密码确认
    if (registerForm.password !== registerForm.confirmPassword) {
      alert(t('auth.passwordMismatch'));
      return;
    }
    
    try {
      const { confirmPassword, ...formData } = registerForm;
      await dispatch(register(formData)).unwrap();
      navigate('/');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage('请输入邮箱地址');
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordMessage('');

    try {
      await api.post('/users/forgot-password/', {
        email: forgotPasswordEmail
      });
      setForgotPasswordMessage('重置密码链接已发送到您的邮箱');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || '发送失败，请重试';
      setForgotPasswordMessage(errorMessage);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Animation */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(14, 165, 233, 0.2)',
            filter: 'blur(100px)',
            top: '10%',
            left: '10%',
            animation: 'float 8s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.2)',
            filter: 'blur(120px)',
            bottom: '10%',
            right: '10%',
            animation: 'float 12s ease-in-out infinite alternate',
          },
          '@keyframes float': {
            '0%': { transform: 'translate(0, 0)' },
            '50%': { transform: 'translate(30px, 40px)' },
            '100%': { transform: 'translate(0, 0)' },
          },
        }}
      />
      
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          flexGrow: 1,
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Paper
            elevation={12}
            sx={{
              p: { xs: 3, sm: 4 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <img src="/logo.svg" alt="PromptManager Logo" style={{ height: 40, marginRight: 12 }} />
              <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
                {t('nav.title')}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </Alert>
            )}

            {twoFactorRequired ? (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box component="form" onSubmit={handleTwoFactorSubmit} sx={{ width: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                    {t('auth.2faTitle')}
                  </Typography>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="twoFactorCode"
                    label={t('auth.2faCode')}
                    type="text"
                    id="twoFactorCode"
                    autoComplete="one-time-code"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TwoFactorIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2, borderRadius: '12px', py: 1.5 }}
                    disabled={isLoading}
                  >
                    {isLoading ? <CircularProgress size={24} /> : t('auth.verify')}
                  </Button>
                </Box>
              </motion.div>
            ) : (
              <>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                  sx={{ mb: 3 }}
                >
                  <Tab icon={<LoginIcon />} iconPosition="start" label={t('auth.loginTab')} />
                  <Tab icon={<RegisterIcon />} iconPosition="start" label={t('auth.registerTab')} />
                </Tabs>

                {activeTab === 0 && (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ width: '100%' }}
                  >
                    <Box component="form" onSubmit={handleLogin} noValidate>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="login-username"
                        label={t('auth.username')}
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={loginForm.username}
                        onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      />
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label={t('auth.password')}
                        type={showPassword ? 'text' : 'password'}
                        id="login-password"
                        autoComplete="current-password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, borderRadius: '12px', py: 1.5 }}
                        disabled={isLoading}
                      >
                        {isLoading ? <CircularProgress size={24} /> : t('auth.loginButton')}
                      </Button>
                      <Link 
                        href="#" 
                        variant="body2" 
                        sx={{ display: 'block', textAlign: 'right', cursor: 'pointer' }}
                        onClick={() => setShowForgotPassword(true)}
                      >
                        {t('auth.forgotPassword')}
                      </Link>
                    </Box>
                  </motion.div>
                )}

                {activeTab === 1 && (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ width: '100%' }}
                  >
                    <Box component="form" onSubmit={handleRegister} noValidate>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="register-username"
                        label={t('auth.username')}
                        name="username"
                        autoComplete="username"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      />
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="register-email"
                        label={t('auth.email')}
                        name="email"
                        autoComplete="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      />
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label={t('auth.password')}
                        type={showPassword ? 'text' : 'password'}
                        id="register-password"
                        autoComplete="new-password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label={t('auth.confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirm-password"
                        autoComplete="new-password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, borderRadius: '12px', py: 1.5 }}
                        disabled={isLoading}
                      >
                        {isLoading ? <CircularProgress size={24} /> : t('auth.registerButton')}
                      </Button>
                    </Box>
                  </motion.div>
                )}
              </>
            )}
            
            <Divider sx={{ my: 2, width: '100%' }}>{t('auth.or')}</Divider>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <LanguageIcon fontSize="small" />
              <Button size="small" onClick={() => changeLanguage('en')}>English</Button>
              <Button size="small" onClick={() => changeLanguage('zh')}>中文</Button>
            </Stack>
          </Paper>
        </motion.div>
      </Container>

      {/* Forgot Password Dialog */}
      <Dialog
        open={showForgotPassword}
        onClose={() => {
          setShowForgotPassword(false);
          setForgotPasswordEmail('');
          setForgotPasswordMessage('');
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            忘记密码
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            请输入您的邮箱地址，我们将向您发送重置密码的链接。请检查您的邮箱（包括垃圾邮件文件夹）。
          </Typography>
          <TextField
            fullWidth
            label="邮箱地址"
            type="email"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
            sx={{ mb: 2 }}
            disabled={forgotPasswordLoading}
          />
          {forgotPasswordMessage && (
            <Alert 
              severity={forgotPasswordMessage.includes('已发送') ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              {forgotPasswordMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setShowForgotPassword(false);
              setForgotPasswordEmail('');
              setForgotPasswordMessage('');
            }}
            disabled={forgotPasswordLoading}
          >
            取消
          </Button>
          <Button
            onClick={handleForgotPassword}
            variant="contained"
            disabled={forgotPasswordLoading || !forgotPasswordEmail}
            sx={{ borderRadius: '8px' }}
          >
            {forgotPasswordLoading ? <CircularProgress size={20} /> : '发送重置链接'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Login;