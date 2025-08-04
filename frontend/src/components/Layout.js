import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Select,
  FormControl,
  Divider,
  Tooltip,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Language as LanguageIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { logout } from '../slices/authSlice';
import { useTheme } from '../contexts/ThemeContext';

function Layout({ children }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isDarkMode, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [langAnchorEl, setLangAnchorEl] = React.useState(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageMenu = (event) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLangAnchorEl(null);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    handleLanguageClose();
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                fontWeight: 700,
                background: 'linear-gradient(45deg, #ffffff, #e0f2fe)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('nav.title')}
            </Typography>
          </motion.div>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                color="inherit" 
                onClick={() => navigate('/')}
                startIcon={<DashboardIcon />}
                sx={{ 
                  mr: 1,
                  borderRadius: '20px',
                  px: 2,
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                {t('nav.dashboard')}
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                color="inherit" 
                onClick={() => navigate('/prompts/new')}
                startIcon={<AddIcon />}
                sx={{ 
                  mr: 2,
                  borderRadius: '20px',
                  px: 2,
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                {t('nav.newPrompt')}
              </Button>
            </motion.div>

            <Tooltip title={t('nav.language')}>
              <IconButton
                color="inherit"
                onClick={handleLanguageMenu}
                sx={{ mx: 1 }}
              >
                <LanguageIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={isDarkMode ? 'Light mode' : 'Dark mode'}>
              <IconButton
                color="inherit"
                onClick={toggleTheme}
                sx={{ mx: 1 }}
              >
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            
            <Button
              color="inherit"
              onClick={handleMenu}
              sx={{ 
                ml: 2,
                borderRadius: '20px',
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              {user?.username}
            </Button>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  borderRadius: '12px',
                  mt: 1,
                  minWidth: 180,
                }
              }}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('nav.profile')}</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { navigate('/settings'); handleClose(); }}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('nav.settings')}</ListItemText>
              </MenuItem>
              {user?.role === 'admin' && (
                <>
                  <Divider />
                  <MenuItem onClick={() => { navigate('/admin'); handleClose(); }}>
                    <ListItemIcon>
                      <AdminIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('nav.admin')}</ListItemText>
                  </MenuItem>
                </>
              )}
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
                </ListItemIcon>
                <ListItemText>{t('nav.logout')}</ListItemText>
              </MenuItem>
            </Menu>

            <Menu
              anchorEl={langAnchorEl}
              open={Boolean(langAnchorEl)}
              onClose={handleLanguageClose}
              PaperProps={{
                sx: {
                  borderRadius: '12px',
                  mt: 1,
                  minWidth: 120,
                }
              }}
            >
              <MenuItem 
                onClick={() => changeLanguage('en')}
                selected={i18n.language === 'en'}
              >
                English
              </MenuItem>
              <MenuItem 
                onClick={() => changeLanguage('zh')}
                selected={i18n.language === 'zh'}
              >
                中文
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Box sx={{ 
          p: { xs: 2, sm: 3 },
          maxWidth: '1200px',
          mx: 'auto',
        }}>
          {children}
        </Box>
      </motion.div>
    </Box>
  );
}

export default Layout;