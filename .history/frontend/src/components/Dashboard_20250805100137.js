import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Fab,
  ButtonGroup,
  Stack,
  Fade,
  Paper,
  Divider,
} from '@mui/material';
import { fetchPrompts, deletePrompt, fetchAllTags } from '../slices/promptSlice';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
  Lock as LockIcon,
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  ContentCopy as CopyIcon,
  History as VersionIcon,
  ViewModule as CardViewIcon,
  ViewList as ListViewIcon,
  Label as TagIcon,
} from '@mui/icons-material';

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { prompts, isLoading, error, tags, isLoadingTags } = useSelector((state) => state.prompts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    dispatch(fetchPrompts()).then(action => {
      if (action.payload) {
        console.log('Fetched prompts:', action.payload);
        // 检查标签数据结构
        action.payload.forEach(prompt => {
          if (prompt.tags) {
            console.log(`Prompt ${prompt.id} tags:`, prompt.tags);
          }
        });
      }
    });
    
    // 获取所有标签
    dispatch(fetchAllTags()).then(action => {
      if (action.payload) {
        console.log('Fetched all tags:', action.payload);
      }
    });
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm(t('dashboard.confirmDelete'))) {
      await dispatch(deletePrompt(id));
    }
  };

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      // 这里可以添加一个 snackbar 或者 toast 提示
      alert(t('dashboard.copySuccess'));
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert(t('dashboard.copyError'));
    }
  };

  const handleVersionSelect = (prompt, versionContent) => {
    // 这里可以实现版本选择逻辑
    handleCopy(versionContent);
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

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || prompt.sharing_mode === filter;
    
    // 标签过滤逻辑
    const hasTags = prompt.tags && Array.isArray(prompt.tags) && prompt.tags.length > 0;
    
    let matchesTag = true;
    if (selectedTag) {
      if (selectedTag.id === 'none') {
        // 筛选无标签的提示词
        matchesTag = !hasTags;
      } else {
        // 筛选包含特定标签的提示词
        matchesTag = hasTags && prompt.tags.some(tag => tag.id === selectedTag.id);
      }
    }
    
    return matchesSearch && matchesFilter && matchesTag;
  });

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

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
            {t('dashboard.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('dashboard.subtitle')}
          </Typography>

          {/* Search and Filter Section */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ mb: 1 }}
          >
            <TextField
              placeholder={t('dashboard.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
            
            <ButtonGroup variant="outlined" sx={{ borderRadius: '12px' }}>
              <Button 
                variant={filter === 'all' ? 'contained' : 'outlined'}
                onClick={() => setFilter('all')}
                sx={{ borderRadius: '12px 0 0 12px' }}
              >
                {t('dashboard.filterAll')}
              </Button>
              <Button 
                variant={filter === 'private' ? 'contained' : 'outlined'}
                onClick={() => setFilter('private')}
              >
                {t('dashboard.filterPrivate')}
              </Button>
              <Button 
                variant={filter === 'team' ? 'contained' : 'outlined'}
                onClick={() => setFilter('team')}
                sx={{ borderRadius: '0 12px 12px 0' }}
              >
                {t('dashboard.filterTeam')}
              </Button>
            </ButtonGroup>

            <ButtonGroup variant="outlined" sx={{ borderRadius: '12px' }}>
              <Button 
                variant={viewMode === 'card' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('card')}
                sx={{ borderRadius: '12px 0 0 12px' }}
                startIcon={<CardViewIcon />}
              >
                {t('dashboard.cardView')}
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('list')}
                sx={{ borderRadius: '0 12px 12px 0' }}
                startIcon={<ListViewIcon />}
              >
                {t('dashboard.listView')}
              </Button>
            </ButtonGroup>
          </Stack>

          {/* 标签筛选区域 */}
          <Box sx={{ mt: 3, mb: 3 }}>
            <Paper sx={{ p: 2, borderRadius: '12px', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <TagIcon sx={{ mr: 1 }} /> {t('dashboard.tags') || '标签筛选'}
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              {isLoadingTags ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {/* 全部标签选项 */}
                  <Chip 
                    label={t('dashboard.allTags') || "全部标签"}
                    onClick={() => setSelectedTag(null)}
                    color={!selectedTag ? "primary" : "default"}
                    variant={!selectedTag ? "filled" : "outlined"}
                    sx={{ 
                      borderRadius: '8px', 
                      m: 0.5,
                      fontWeight: !selectedTag ? 600 : 400
                    }}
                  />
                  
                  {/* 无标签选项 */}
                  <Chip 
                    label={t('dashboard.untagged') || "无标签"}
                    onClick={() => setSelectedTag({ id: 'none', name: '无标签' })}
                    color={selectedTag?.id === 'none' ? "secondary" : "default"}
                    variant={selectedTag?.id === 'none' ? "filled" : "outlined"}
                    sx={{ 
                      borderRadius: '8px', 
                      m: 0.5,
                      fontWeight: selectedTag?.id === 'none' ? 600 : 400
                    }}
                  />
                  
                  {/* 所有可用标签 */}
                  {Array.isArray(tags) && tags.length > 0 && tags.map(tag => (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      onClick={() => setSelectedTag(selectedTag?.id === tag.id ? null : tag)}
                      sx={{
                        borderRadius: '8px',
                        m: 0.5,
                        backgroundColor: selectedTag?.id === tag.id ? tag.color : tag.color + '20',
                        color: selectedTag?.id === tag.id ? '#fff' : tag.color,
                        border: `1px solid ${tag.color}40`,
                        fontWeight: selectedTag?.id === tag.id ? 600 : 400,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: selectedTag?.id === tag.id ? tag.color : tag.color + '30',
                        }
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Paper>
          </Box>
          
          {/* 当前选中的标签显示 */}
          {selectedTag && (
            <Box sx={{ mb: 2 }}>
              <Chip
                icon={<TagIcon />}
                label={`${t('dashboard.currentTag') || '当前标签'}: ${selectedTag.name}`}
                onDelete={() => setSelectedTag(null)}
                color="primary"
                variant="outlined"
                sx={{ borderRadius: '8px' }}
              />
            </Box>
          )}
        </Box>
      </motion.div>

      {filteredPrompts.length === 0 ? (
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
            <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
              {searchTerm || filter !== 'all' ? 'No prompts match your criteria' : t('dashboard.noPrompts')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {searchTerm || filter !== 'all' ? 'Try adjusting your search or filter' : t('dashboard.noPromptsSubtitle')}
            </Typography>
            {(!searchTerm && filter === 'all') && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
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
              </motion.div>
            )}
          </Card>
        </motion.div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            {viewMode === 'card' ? (
              <Grid container spacing={3}>
                {filteredPrompts.map((prompt, index) => (
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
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Chip
                                icon={prompt.sharing_mode === 'team' ? <ShareIcon fontSize="small" /> : <LockIcon fontSize="small" />}
                                label={prompt.sharing_mode === 'team' ? t('dashboard.team') : t('dashboard.private')}
                                size="small"
                                color={prompt.sharing_mode === 'team' ? 'primary' : 'default'}
                                sx={{ borderRadius: '8px' }}
                              />
                            </motion.div>
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
                          
                          {/* 标签显示 */}
                          {prompt.tags && prompt.tags.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                {prompt.tags.slice(0, 3).map((tag) => (
                                  <Chip
                                    key={tag.id}
                                    label={tag.name}
                                    size="small"
                                    onClick={() => {
                                      console.log('Tag clicked:', tag);
                                      setSelectedTag(tag);
                                    }}
                                    sx={{ 
                                      borderRadius: '6px',
                                      fontSize: '0.75rem',
                                      height: '24px',
                                      backgroundColor: tag.color + '20',
                                      color: tag.color,
                                      border: `1px solid ${tag.color}40`,
                                      cursor: 'pointer',
                                      '&:hover': {
                                        backgroundColor: tag.color + '30',
                                      }
                                    }}
                                  />
                                ))}
                                {prompt.tags.length > 3 && (
                                  <Chip
                                    label={`+${prompt.tags.length - 3}`}
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
            ) : (
              // 列表视图
              <Stack spacing={2}>
                {filteredPrompts.map((prompt, index) => (
                  <motion.div
                    key={prompt.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card sx={{ 
                      p: 2,
                      '&:hover': {
                        boxShadow: (theme) => theme.shadows[4],
                      }
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {prompt.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                mb: 1
                              }}
                            >
                              {prompt.content}
                            </Typography>
                            {/* 标签显示 */}
                            {prompt.tags && prompt.tags.length > 0 && (
                              <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
                                {prompt.tags.slice(0, 3).map((tag) => (
                                  <Chip
                                    key={tag.id}
                                    label={tag.name}
                                    size="small"
                                    onClick={() => setSelectedTag(tag)}
                                    sx={{ 
                                      borderRadius: '6px',
                                      fontSize: '0.7rem',
                                      height: '20px',
                                      backgroundColor: tag.color + '20',
                                      color: tag.color,
                                      border: `1px solid ${tag.color}40`,
                                      cursor: 'pointer',
                                      '&:hover': {
                                        backgroundColor: tag.color + '30',
                                      }
                                    }}
                                  />
                                ))}
                                {prompt.tags.length > 3 && (
                                  <Chip
                                    label={`+${prompt.tags.length - 3}`}
                                    size="small"
                                    sx={{ 
                                      borderRadius: '6px',
                                      fontSize: '0.7rem',
                                      height: '20px',
                                    }}
                                  />
                                )}
                              </Stack>
                            )}
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {t('dashboard.author')} {prompt.author_username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {t('dashboard.updated')} {formatDate(prompt.updated_at)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {t('dashboard.version')} {prompt.latest_version?.version_number || 1}
                            </Typography>
                            <Chip
                              icon={prompt.sharing_mode === 'team' ? <ShareIcon fontSize="small" /> : <LockIcon fontSize="small" />}
                              label={prompt.sharing_mode === 'team' ? t('dashboard.team') : t('dashboard.private')}
                              size="small"
                              color={prompt.sharing_mode === 'team' ? 'primary' : 'default'}
                              sx={{ borderRadius: '8px', mt: 1 }}
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
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
                          </Stack>
                        </Grid>
                      </Grid>
                    </Card>
                  </motion.div>
                ))}
              </Stack>
            )}
          </AnimatePresence>
          
          {/* Floating Action Button for Mobile */}
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
                display: { xs: 'flex', sm: 'none' },
              }}
            >
              <AddIcon />
            </Fab>
          </motion.div>
        </>
      )}
    </Box>
  );
}

export default Dashboard;
