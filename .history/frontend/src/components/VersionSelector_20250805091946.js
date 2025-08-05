import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ContentCopy as CopyIcon,
  Restore as RestoreIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import axios from 'axios';

function VersionSelector() {
  const { promptId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState(null);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPromptAndVersions();
  }, [promptId]);

  const fetchPromptAndVersions = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // 获取提示词详情
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const promptResponse = await axios.get(`${API_BASE_URL}/prompts/${promptId}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setPrompt(promptResponse.data);

      // 获取版本列表
      const versionsResponse = await axios.get(`${API_BASE_URL}/prompts/${promptId}/versions/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setVersions(versionsResponse.data);
      
      if (versionsResponse.data.length > 0) {
        setSelectedVersion(versionsResponse.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch prompt versions:', err);
      setError('Failed to load prompt versions');
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

  const handleRestore = async (versionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/prompts/${promptId}/versions/${versionId}/restore/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Version restored successfully');
      navigate(`/prompts/${promptId}`);
    } catch (err) {
      console.error('Failed to restore version:', err);
      alert('Failed to restore version');
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
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate('/dashboard')}
            sx={{ borderRadius: '8px' }}
          >
            <BackIcon />
          </IconButton>
          <HistoryIcon color="primary" />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {t('dashboard.selectVersion')}
          </Typography>
        </Box>

        {prompt && (
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            {prompt.title}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 200px)' }}>
          {/* 版本列表 */}
          <Paper sx={{ 
            width: 300, 
            overflow: 'auto',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Versions ({versions.length})
              </Typography>
            </Box>
            <List sx={{ p: 0 }}>
              {versions.map((version, index) => (
                <React.Fragment key={version.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={selectedVersion?.id === version.id}
                      onClick={() => setSelectedVersion(version)}
                      sx={{
                        py: 2,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              v{version.version_number}
                            </Typography>
                            {index === 0 && (
                              <Chip 
                                label="Latest" 
                                size="small" 
                                color="primary"
                                sx={{ borderRadius: '6px' }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {version.author_username}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {formatDate(version.created_at)}
                            </Typography>
                            {version.commit_message && (
                              <Typography 
                                variant="caption" 
                                display="block"
                                sx={{ 
                                  fontStyle: 'italic',
                                  mt: 0.5,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                "{version.commit_message}"
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < versions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>

          {/* 版本内容预览 */}
          <Paper sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            {selectedVersion ? (
              <>
                <Box sx={{ 
                  p: 2, 
                  borderBottom: '1px solid', 
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Version {selectedVersion.version_number}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      by {selectedVersion.author_username} • {formatDate(selectedVersion.created_at)}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title={t('dashboard.copyPrompt')}>
                      <IconButton
                        onClick={() => handleCopy(selectedVersion.content)}
                        color="primary"
                        sx={{ borderRadius: '8px' }}
                      >
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Restore this version">
                      <IconButton
                        onClick={() => handleRestore(selectedVersion.id)}
                        color="secondary"
                        sx={{ borderRadius: '8px' }}
                      >
                        <RestoreIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
                
                {selectedVersion.commit_message && (
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: 'action.hover',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Commit Message:
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      "{selectedVersion.commit_message}"
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ 
                  p: 2, 
                  flex: 1, 
                  overflow: 'auto',
                  backgroundColor: 'background.default'
                }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      fontFamily: 'monospace',
                      fontSize: '0.95rem'
                    }}
                  >
                    {selectedVersion.content}
                  </Typography>
                </Box>
              </>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%' 
              }}>
                <Typography variant="h6" color="text.secondary">
                  Select a version to preview
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </motion.div>
    </Box>
  );
}

export default VersionSelector;
