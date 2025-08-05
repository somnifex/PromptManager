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
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Language as LanguageIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
} from '@mui/icons-material';

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
      await dispatch(login(loginForm)).unwrap();
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
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
          opacity: 0.1,
          background: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><defs><pattern id=\'grid\' width=\'10\' height=\'10\' patternUnits=\'userSpaceOnUse\'><path d=\'M 10 0 L 0 0 0 10\' fill=\'none\' stroke=\'%23000\' stroke-width=\'0.5\'/></pattern></defs><rect width=\'100\' height=\'100\' fill=\'url(%23grid)\'/></svg>") repeat',
        }}
      />

      {/* Language Switcher */}
      <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 1000 }}>
        <Stack direction="row" spacing={1}>
          <IconButton
            onClick={() => changeLanguage('en')}
            color={i18n.language === 'en' ? 'primary' : 'default'}
            sx={{ 
              borderRadius: '8px',
              backgroundColor: i18n.language === 'en' ? 'primary.main' : 'transparent',
              color: i18n.language === 'en' ? 'white' : 'text.primary',
              '&:hover': {
                backgroundColor: i18n.language === 'en' ? 'primary.dark' : 'action.hover',
              }
            }}
          >
            EN
          </IconButton>
          <IconButton
            onClick={() => changeLanguage('zh')}
            color={i18n.language === 'zh' ? 'primary' : 'default'}
            sx={{ 
              borderRadius: '8px',
              backgroundColor: i18n.language === 'zh' ? 'primary.main' : 'transparent',
              color: i18n.language === 'zh' ? 'white' : 'text.primary',
              '&:hover': {
                backgroundColor: i18n.language === 'zh' ? 'primary.dark' : 'action.hover',
              }
            }}
          >
            中
          </IconButton>
        </Stack>
      </Box>

      <Container component="main" maxWidth="sm" sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%' }}
        >
          <Paper 
            elevation={0} 
            sx={{ 
              padding: { xs: 3, sm: 6 },
              borderRadius: '24px',
              background: theme.palette.mode === 'dark' 
                ? 'rgba(30, 41, 59, 0.8)' 
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 20px 40px rgba(0, 0, 0, 0.3)'
                : '0 20px 40px rgba(0, 0, 0, 0.1)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography 
                  component="h1" 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #0ea5e9, #8b5cf6)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  {t('nav.title')}
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  {activeTab === 0 ? t('auth.loginTitle') : t('auth.registerTitle')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {activeTab === 0 ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
                </Typography>
              </Box>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)} 
                sx={{ 
                  mb: 4,
                  '& .MuiTabs-flexContainer': {
                    justifyContent: 'center',
                  },
                  '& .MuiTab-root': {
                    borderRadius: '12px',
                    mx: 1,
                    minWidth: 120,
                    fontWeight: 600,
                  }
                }}
              >
                <Tab 
                  label={t('auth.login')} 
                  icon={<LoginIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  label={t('auth.register')} 
                  icon={<RegisterIcon />} 
                  iconPosition="start"
                />
              </Tabs>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: '12px',
                    }}
                  >
                    {error}
                  </Alert>
                </motion.div>
              )}

              {activeTab === 0 ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box component="form" onSubmit={handleLogin}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="username"
                      label={t('auth.username')}
                      name="username"
                      autoComplete="username"
                      autoFocus
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label={t('auth.password')}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="current-password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        sx={{ 
                          mt: 2, 
                          mb: 3,
                          borderRadius: '12px',
                          py: 1.5,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                        }}
                      >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : t('auth.loginButton')}
                      </Button>
                    </motion.div>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <Link
                        component="button"
                        variant="body2"
                        onClick={() => setActiveTab(1)}
                        sx={{ 
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {t('auth.switchToRegister')}
                      </Link>
                    </Box>
                  </Box>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box component="form" onSubmit={handleRegister}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="username"
                      label={t('auth.username')}
                      name="username"
                      autoComplete="username"
                      autoFocus
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label={t('auth.email')}
                      name="email"
                      autoComplete="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label={t('auth.password')}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="new-password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="confirmPassword"
                      label={t('auth.confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      autoComplete="new-password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      error={registerForm.password && registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword}
                      helperText={
                        registerForm.password && registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword
                          ? t('auth.passwordMismatch')
                          : ''
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      select
                      name="role"
                      label={t('auth.role')}
                      id="role"
                      value={registerForm.role}
                      onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                      SelectProps={{ native: true }}
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </TextField>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        sx={{ 
                          mt: 2, 
                          mb: 3,
                          borderRadius: '12px',
                          py: 1.5,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                        }}
                      >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : t('auth.registerButton')}
                      </Button>
                    </motion.div>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <Link
                        component="button"
                        variant="body2"
                        onClick={() => setActiveTab(0)}
                        sx={{ 
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {t('auth.switchToLogin')}
                      </Link>
                    </Box>
                  </Box>
                </motion.div>
              )}
            </motion.div>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}

export default Login;