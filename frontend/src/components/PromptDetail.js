import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Paper,
  Stack,
  Tooltip,
  Avatar,
  useTheme,
  Fade,
} from '@mui/material';
import {
  Edit as EditIcon,
  History as HistoryIcon,
  Restore as RestoreIcon,
  Share as ShareIcon,
  Lock as LockIcon,
  ContentCopy as CopyIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { fetchPromptDetail, fetchPromptVersions, restoreVersion } from '../slices/promptSlice';

function PromptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const theme = useTheme();
  const { currentPrompt, versions, isLoading, error } = useSelector((state) => state.prompts);
  const { user } = useSelector((state) => state.auth);

  const [showVersions, setShowVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchPromptDetail(id));
      dispatch(fetchPromptVersions(id));
    }
  }, [dispatch, id]);

  const handleEdit = () => {
    navigate(`/prompts/${id}/edit`);
  };

  const handleRestore = async (versionId) => {
    if (window.confirm(t('promptDetail.confirmRestore') || 'Are you sure you want to restore this version? This will create a new version with the restored content.')) {
      try {
        await dispatch(restoreVersion({ promptId: id, versionId })).unwrap();
        dispatch(fetchPromptDetail(id));
        dispatch(fetchPromptVersions(id));
        setShowVersions(false);
      } catch (err) {
        console.error('Failed to restore version:', err);
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentPrompt.content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  const formatDate = (dateString) => {
    try {
      const locale = t('common.locale');
      // 确保 locale 有效，如果未定义则使用默认值
      const validLocale = locale && locale !== 'common.locale' ? locale : 'en-US';
      return new Date(dateString).toLocaleDateString(validLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.warn('Date formatting error:', error);
      // 回退到简单的日期格式
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const handleVersionClick = (version) => {
    setSelectedVersion(version);
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <CircularProgress size={60} />
        </motion.div>
      </Box>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      </motion.div>
    );
  }

  if (!currentPrompt) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
          {t('promptDetail.notFound') || 'Prompt not found'}
        </Alert>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <IconButton
                  onClick={() => navigate('/')}
                  sx={{ 
                    backgroundColor: 'action.hover',
                    '&:hover': { backgroundColor: 'action.selected' }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </motion.div>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #0ea5e9, #8b5cf6)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  flex: 1,
                }}
              >
                {currentPrompt.title}
              </Typography>
            </Stack>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
              <Box>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                  >
                    <Chip
                      icon={currentPrompt.sharing_mode === 'team' ? <ShareIcon fontSize="small" /> : <LockIcon fontSize="small" />}
                      label={currentPrompt.sharing_mode === 'team' ? t('dashboard.team') : t('dashboard.private')}
                      color={currentPrompt.sharing_mode === 'team' ? 'primary' : 'default'}
                      sx={{ borderRadius: '8px' }}
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                  >
                    <Chip
                      label={`${t('dashboard.version')} ${currentPrompt.latest_version?.version_number || 1}`}
                      variant="outlined"
                      sx={{ borderRadius: '8px' }}
                    />
                  </motion.div>
                </Stack>
                
                <Stack direction="row" spacing={2} alignItems="center" sx={{ color: 'text.secondary' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PersonIcon fontSize="small" />
                    <Typography variant="body2">
                      {currentPrompt.author_username}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ScheduleIcon fontSize="small" />
                    <Typography variant="body2">
                      {t('dashboard.updated')} {formatDate(currentPrompt.updated_at)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
              
              <Stack direction="row" spacing={1}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<HistoryIcon />}
                    onClick={() => setShowVersions(true)}
                    sx={{ borderRadius: '12px' }}
                  >
                    {t('promptDetail.history') || 'History'} ({versions.length})
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    sx={{ borderRadius: '12px' }}
                  >
                    {t('dashboard.editPrompt')}
                  </Button>
                </motion.div>
              </Stack>
            </Stack>
          </Box>
        </motion.div>

        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card 
            sx={{ 
              borderRadius: '20px',
              background: theme.palette.mode === 'dark' 
                ? 'rgba(30, 41, 59, 0.8)' 
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t('promptForm.content')}
                </Typography>
                <Tooltip title={copySuccess ? t('common.copied') || 'Copied!' : t('common.copy') || 'Copy'}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <IconButton
                      onClick={handleCopy}
                      color={copySuccess ? 'success' : 'default'}
                      sx={{ borderRadius: '8px' }}
                    >
                      <CopyIcon />
                    </IconButton>
                  </motion.div>
                </Tooltip>
              </Stack>
              
              <Paper 
                sx={{ 
                  p: 3, 
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)',
                  minHeight: 200,
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography 
                  variant="body1" 
                  component="pre" 
                  sx={{ 
                    whiteSpace: 'pre-wrap', 
                    fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                    lineHeight: 1.6,
                    fontSize: '0.95rem',
                  }}
                >
                  {currentPrompt.content}
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </motion.div>

        {/* Version History Dialog */}
        <Dialog
          open={showVersions}
          onClose={() => setShowVersions(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '20px',
              background: theme.palette.mode === 'dark' 
                ? 'rgba(30, 41, 59, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {t('promptDetail.versionHistory') || 'Version History'}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <List sx={{ py: 0 }}>
              <AnimatePresence>
                {versions.map((version, index) => (
                  <motion.div
                    key={version.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ListItem
                      button
                      onClick={() => handleVersionClick(version)}
                      selected={selectedVersion?.id === version.id}
                      sx={{
                        borderRadius: '12px',
                        mb: 1,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          }
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {t('dashboard.version')} {version.version_number}
                          </Typography>
                        }
                        secondary={
                          <Stack spacing={0.5} sx={{ mt: 1 }}>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              {formatDate(version.created_at)} • {version.author_username}
                            </Typography>
                            {version.commit_message && (
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontStyle: 'italic',
                                  opacity: 0.9,
                                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                  p: 1,
                                  borderRadius: '6px',
                                  mt: 1,
                                }}
                              >
                                "{version.commit_message}"
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title={t('promptDetail.restore') || 'Restore this version'}>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <IconButton
                              edge="end"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestore(version.id);
                              }}
                              sx={{ borderRadius: '8px' }}
                            >
                              <RestoreIcon />
                            </IconButton>
                          </motion.div>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < versions.length - 1 && <Divider sx={{ my: 1 }} />}
                  </motion.div>
                ))}
              </AnimatePresence>
            </List>

            <AnimatePresence>
              {selectedVersion && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {t('dashboard.version')} {selectedVersion.version_number} {t('promptForm.content')}
                    </Typography>
                    <Paper 
                      sx={{ 
                        p: 3, 
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)',
                        maxHeight: 300, 
                        overflow: 'auto',
                        borderRadius: '12px',
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography 
                        variant="body1" 
                        component="pre" 
                        sx={{ 
                          whiteSpace: 'pre-wrap', 
                          fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                          lineHeight: 1.6,
                          fontSize: '0.9rem',
                        }}
                      >
                        {selectedVersion.content}
                      </Typography>
                    </Paper>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => setShowVersions(false)}
                variant="contained"
                sx={{ borderRadius: '12px', px: 3 }}
              >
                {t('common.close')}
              </Button>
            </motion.div>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
}

export default PromptDetail;