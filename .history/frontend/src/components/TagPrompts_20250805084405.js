import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Fab,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  History as VersionIcon,
  Add as AddIcon,
  Label as TagIcon,
} from '@mui/icons-material';
import axios from 'axios';

function TagPrompts() {
  const { tagId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [tag, setTag] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTagPrompts();
  }, [tagId]);

  const fetchTagPrompts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`/api/prompts/tags/${tagId}/prompts/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTag(response.data.tag);
      setPrompts(response.data.prompts);
    } catch (err) {
      console.error('Failed to fetch tag prompts:', err);
      setError('Failed to load prompts for this tag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      alert(t('dashboard.copySuccess'));
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert(t('dashboard.copyError'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('dashboard.confirmDelete'))) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/prompts/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // 重新获取数据
        fetchTagPrompts();
      } catch (err) {
        console.error('Failed to delete prompt:', err);
        alert('Failed to delete prompt');
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      const locale = t('common.locale');
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
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 头部 */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <IconButton 
              onClick={() => navigate('/dashboard')}
              sx={{ borderRadius: '8px' }}
            >
              <BackIcon />
            </IconButton>
            <TagIcon sx={{ color: tag?.color || 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {tag?.name || 'Tag'}
            </Typography>
            {tag && (
              <Chip
                label={`${prompts.length} ${prompts.length === 1 ? 'prompt' : 'prompts'}`}
                sx={{ 
                  backgroundColor: tag.color + '20',
                  color: tag.color,
                  border: `1px solid ${tag.color}40`,
                  borderRadius: '8px'
                }}
              />
            )}
          </Stack>
          <Typography variant="body1" color="text.secondary">
            Browse all prompts tagged with "{tag?.name}"
          </Typography>
        </Box>

        {/* 提示词列表 */}
        {prompts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ 
              p: 6, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
            }}>
              <TagIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                No prompts found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                No prompts are currently tagged with "{tag?.name}"
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/prompts/new')}
                startIcon={<AddIcon />}
                sx={{ 
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                {t('dashboard.createPrompt')}
              </Button>
            </Card>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <Grid container spacing={3}>
              {prompts.map((prompt, index) => (
                <Grid item xs={12} md={6} lg={4} key={prompt.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'visible',
                    }}>
                      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start', 
                          mb: 2 
                        }}>
                          <Typography 
                            variant="h6" 
                            component="h2" 
                            gutterBottom
                            sx={{ 
                              fontWeight: 600,
                              lineHeight: 1.3,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {prompt.title}
                          </Typography>
                          <Chip
                            label={prompt.sharing_mode === 'team' ? t('dashboard.team') : t('dashboard.private')}
                            size="small"
                            color={prompt.sharing_mode === 'team' ? 'primary' : 'default'}
                            sx={{ borderRadius: '8px' }}
                          />
                        </Box>
                        
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.5,
                          }}
                        >
                          {prompt.content}
                        </Typography>
                        
                        {/* 其他标签显示 */}
                        {prompt.tags && prompt.tags.length > 1 && (
                          <Box sx={{ mb: 2 }}>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                              {prompt.tags.filter(t => t.id !== tag?.id).slice(0, 2).map((otherTag) => (
                                <Chip
                                  key={otherTag.id}
                                  label={otherTag.name}
                                  size="small"
                                  onClick={() => navigate(`/tags/${otherTag.id}/prompts`)}
                                  sx={{ 
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    height: '24px',
                                    backgroundColor: otherTag.color + '20',
                                    color: otherTag.color,
                                    border: `1px solid ${otherTag.color}40`,
                                    cursor: 'pointer',
                                    '&:hover': {
                                      backgroundColor: otherTag.color + '30',
                                    }
                                  }}
                                />
                              ))}
                              {prompt.tags.filter(t => t.id !== tag?.id).length > 2 && (
                                <Chip
                                  label={`+${prompt.tags.filter(t => t.id !== tag?.id).length - 2}`}
                                  size="small"
                                  sx={{ 
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    height: '24px',
                                  }}
                                />
                              )}
                            </Stack>
                          </Box>
                        )}
                        
                        <Box sx={{ mt: 'auto' }}>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            {t('dashboard.author')} {prompt.author_username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            {t('dashboard.updated')} {formatDate(prompt.updated_at)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {t('dashboard.version')} {prompt.latest_version?.version_number || 1}
                          </Typography>
                        </Box>
                      </CardContent>
                      
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Tooltip title={t('dashboard.copyPrompt')}>
                            <IconButton
                              size="small"
                              onClick={() => handleCopy(prompt.content)}
                              color="success"
                              sx={{ borderRadius: '8px' }}
                            >
                              <CopyIcon />
                            </IconButton>
                          </Tooltip>
                        </motion.div>
                        
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Tooltip title={t('dashboard.selectVersion')}>
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/prompts/${prompt.id}/versions`)}
                              color="info"
                              sx={{ borderRadius: '8px' }}
                            >
                              <VersionIcon />
                            </IconButton>
                          </Tooltip>
                        </motion.div>
                        
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Tooltip title={t('dashboard.viewPrompt')}>
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/prompts/${prompt.id}`)}
                              color="primary"
                              sx={{ borderRadius: '8px' }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </motion.div>
                        
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Tooltip title={t('dashboard.editPrompt')}>
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/prompts/${prompt.id}/edit`)}
                              color="secondary"
                              sx={{ borderRadius: '8px' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </motion.div>
                        
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Tooltip title={t('dashboard.deletePrompt')}>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(prompt.id)}
                              color="error"
                              sx={{ borderRadius: '8px' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </motion.div>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </AnimatePresence>
        )}

        {/* Floating Action Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        >
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => navigate('/prompts/new')}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
            }}
          >
            <AddIcon />
          </Fab>
        </motion.div>
      </motion.div>
    </Box>
  );
}

export default TagPrompts;
