import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Divider,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  Share as ShareIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { createPrompt, updatePrompt, fetchPromptDetail } from '../slices/promptSlice';

function PromptForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { t } = useTranslation();
  const theme = useTheme();
  const { currentPrompt, isLoading, error } = useSelector((state) => state.prompts);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    sharing_mode: 'private',
    commit_message: '',
    tag_ids: [],
  });

  const [errors, setErrors] = useState({
    title: '',
    content: '',
  });

  const [availableTags, setAvailableTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const isEditing = Boolean(id);

  // 获取可用标签
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_BASE_URL}/prompts/tags/`, {
        headers: { Authorization: `Token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // 确保 availableTags 是一个数组
        const tags = Array.isArray(data) ? data : (data.results || data.tags || []);
        console.log('Fetched tags:', tags);
        setAvailableTags(tags);
      }
    } catch (err) {
      console.error('Failed to fetch tags:', err);
      // 确保在出错时也设置为空数组
      setAvailableTags([]);
    }
  };

  const createTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      setIsCreatingTag(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_BASE_URL}/prompts/tags/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}` // 随机颜色，确保6位
        })
      });
      
      if (response.ok) {
        const newTag = await response.json();
        setAvailableTags(prev => [...prev, newTag]);
        setFormData(prev => ({
          ...prev,
          tag_ids: [...prev.tag_ids, newTag.id]
        }));
        setNewTagName('');
      }
    } catch (err) {
      console.error('Failed to create tag:', err);
    } finally {
      setIsCreatingTag(false);
    }
  };

  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchPromptDetail(id));
    }
  }, [dispatch, id, isEditing]);

  useEffect(() => {
    if (currentPrompt && isEditing) {
      setFormData({
        title: currentPrompt.title,
        content: currentPrompt.content,
        sharing_mode: currentPrompt.sharing_mode,
        commit_message: '',
        tag_ids: currentPrompt.tags ? currentPrompt.tags.map(tag => tag.id) : [],
      });
    }
  }, [currentPrompt, isEditing]);

  const validateForm = () => {
    const newErrors = { title: '', content: '' };
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = t('promptForm.titleRequired') || 'Title is required';
      isValid = false;
    }

    if (!formData.content.trim()) {
      newErrors.content = t('promptForm.contentRequired') || 'Content is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing && id) {
        await dispatch(updatePrompt({ id, ...formData })).unwrap();
      } else {
        await dispatch(createPrompt(formData)).unwrap();
      }
      navigate('/');
    } catch (err) {
      console.error('Failed to save prompt:', err);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (isLoading && isEditing) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #0ea5e9, #8b5cf6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {isEditing ? t('promptForm.editPrompt') : t('promptForm.newPrompt')}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <DescriptionIcon color="action" />
            <Typography variant="body1" color="text.secondary">
              {isEditing ? 'Update your prompt with new changes' : 'Create a new prompt for your library'}
            </Typography>
          </Stack>
        </Box>

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
            <Box component="form" onSubmit={handleSubmit}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <TextField
                  fullWidth
                  label={t('promptForm.title')}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  margin="normal"
                  required
                  error={!!errors.title}
                  helperText={errors.title}
                  placeholder={t('promptForm.titlePlaceholder')}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <TextField
                  fullWidth
                  label={t('promptForm.content')}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  margin="normal"
                  required
                  multiline
                  rows={10}
                  error={!!errors.content}
                  helperText={errors.content}
                  placeholder={t('promptForm.contentPlaceholder')}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <FormControl 
                  fullWidth 
                  margin="normal"
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                >
                  <InputLabel>{t('promptForm.sharingMode')}</InputLabel>
                  <Select
                    value={formData.sharing_mode}
                    label={t('promptForm.sharingMode')}
                    onChange={(e) => setFormData({ ...formData, sharing_mode: e.target.value })}
                  >
                    <MenuItem value="private">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LockIcon fontSize="small" />
                        <span>{t('dashboard.private')}</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="team">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ShareIcon fontSize="small" />
                        <span>{t('dashboard.team')}</span>
                      </Stack>
                    </MenuItem>
                  </Select>
                </FormControl>
              </motion.div>

              {/* 标签选择 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.35 }}
              >
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('dashboard.tags')}
                  </Typography>
                  
                  {/* 已选择的标签 */}
                  {formData.tag_ids.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {formData.tag_ids.map((tagId) => {
                          const tag = availableTags.find(t => t.id === tagId);
                          return tag ? (
                            <Chip
                              key={tag.id}
                              label={tag.name}
                              onDelete={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  tag_ids: prev.tag_ids.filter(id => id !== tagId)
                                }));
                              }}
                              sx={{
                                backgroundColor: tag.color + '20',
                                color: tag.color,
                                border: `1px solid ${tag.color}40`,
                                borderRadius: '8px',
                              }}
                            />
                          ) : null;
                        })}
                      </Stack>
                    </Box>
                  )}
                  
                  {/* 可选择的标签 */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                      Available Tags:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {Array.isArray(availableTags) && availableTags.filter(tag => tag && tag.id && !formData.tag_ids.includes(tag.id)).map((tag) => (
                        <Chip
                          key={tag.id}
                          label={tag.name}
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              tag_ids: [...prev.tag_ids, tag.id]
                            }));
                          }}
                          sx={{
                            backgroundColor: tag.color + '10',
                            color: tag.color,
                            border: `1px solid ${tag.color}30`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: tag.color + '20',
                            }
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                  
                  {/* 创建新标签 */}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      size="small"
                      label="New Tag"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault(); // 阻止表单默认提交
                          if (newTagName.trim() && !isCreatingTag) {
                            createTag();
                          }
                        }
                      }}
                      sx={{
                        flexGrow: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={(e) => {
                        e.preventDefault();
                        createTag();
                      }}
                      disabled={!newTagName.trim() || isCreatingTag}
                      sx={{ borderRadius: '8px' }}
                    >
                      {isCreatingTag ? <CircularProgress size={20} /> : 'Add'}
                    </Button>
                  </Box>
                </Box>
              </motion.div>

              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <TextField
                    fullWidth
                    label={t('promptForm.versionNote')}
                    value={formData.commit_message}
                    onChange={(e) => setFormData({ ...formData, commit_message: e.target.value })}
                    margin="normal"
                    multiline
                    rows={3}
                    placeholder={t('promptForm.versionNotePlaceholder')}
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                  />
                </motion.div>
              )}

              <Divider sx={{ my: 3 }} />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ flex: 1 }}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading}
                      fullWidth
                      size="large"
                      startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      sx={{ 
                        borderRadius: '12px',
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                      }}
                    >
                      {isLoading ? t('common.loading') : (isEditing ? t('promptForm.save') : t('promptForm.save'))}
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      disabled={isLoading}
                      startIcon={<CancelIcon />}
                      sx={{ 
                        borderRadius: '12px',
                        py: 1.5,
                        px: 3,
                        fontSize: '1.1rem',
                        fontWeight: 500,
                      }}
                    >
                      {t('promptForm.cancel')}
                    </Button>
                  </motion.div>
                </Stack>
              </motion.div>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );
}

export default PromptForm;