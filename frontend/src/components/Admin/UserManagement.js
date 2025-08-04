import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Pagination,
    Tooltip,
    Menu,
    ListItemIcon,
    ListItemText,
    InputAdornment,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Block as BlockIcon,
    CheckCircle as ActivateIcon,
    AdminPanelSettings as AdminIcon,
    Person as UserIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

function UserManagement() {
    const { t } = useTranslation();
    const { token } = useSelector((state) => state.auth);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'user',
        is_active: true,
    });
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [page]);

    // 添加搜索的防抖处理
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (page !== 1) {
                setPage(1); // 搜索时重置到第一页
            } else {
                fetchUsers();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
      });
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_BASE_URL}/users/admin/users/?${params}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setUsers(data.users || []);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError(error.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };    const handleOpenDialog = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                is_active: user.is_active,
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                email: '',
                first_name: '',
                last_name: '',
                role: 'user',
                is_active: true,
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
        setFormData({
            username: '',
            email: '',
            first_name: '',
            last_name: '',
            role: 'user',
            is_active: true,
        });
    };

  const handleSaveUser = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      let url, method;
      
      if (editingUser) {
        url = `${API_BASE_URL}/users/admin/users/${editingUser.id}/`;
        method = 'PUT';
      } else {
        url = `${API_BASE_URL}/users/admin/users/`;
        method = 'POST';
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = JSON.stringify(errorData);
        } catch (e) {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }
      
      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
      setError(error.message);
    }
  };    const handleMenuOpen = (event, user) => {
        setMenuAnchor(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedUser(null);
    };

  const handleToggleUserStatus = async (user) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const url = `${API_BASE_URL}/users/admin/users/${user.id}/`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = JSON.stringify(errorData);
        } catch (e) {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }
      
      handleMenuClose();
      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      setError(error.message);
    }
  };    const handleDeleteUser = async (userId) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const url = `${API_BASE_URL}/users/admin/users/${userId}/`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = JSON.stringify(errorData);
        } catch (e) {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }
      
      handleMenuClose();
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      setError(error.message);
    }
  };

  const handleMenuClick = (event, user) => {
        setMenuAnchor(event.currentTarget);
        setSelectedUser(user);
    };

    const formatDate = (dateString) => {
        try {
            const locale = t('common.locale');
            // 确保 locale 有效，如果未定义则使用默认值
            const validLocale = locale && locale !== 'common.locale' ? locale : 'zh-CN';
            return new Date(dateString).toLocaleDateString(validLocale, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (error) {
            console.warn('Date formatting error:', error);
            // 回退到简单的日期格式
            return new Date(dateString).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t('admin.users.title')}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ borderRadius: '20px' }}
                >
                    {t('admin.users.addUser')}
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {t('admin.users.fetchError')}: {error}
                </Alert>
            )}

            <Box sx={{ mb: 3 }}>
                <TextField
                    placeholder={t('admin.users.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ maxWidth: 400 }}
                />
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.50' }}>
                            <TableCell>{t('admin.users.username')}</TableCell>
                            <TableCell>{t('admin.users.email')}</TableCell>
                            <TableCell>{t('admin.users.name')}</TableCell>
                            <TableCell>{t('admin.users.role')}</TableCell>
                            <TableCell>{t('admin.users.status')}</TableCell>
                            <TableCell>{t('admin.users.lastLogin')}</TableCell>
                            <TableCell align="center">{t('admin.users.actions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user, index) => (
                            <motion.tr
                                key={user.id}
                                component={TableRow}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <TableCell sx={{ fontWeight: 500 }}>{user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                                <TableCell>
                                    <Chip
                                        icon={user.role === 'admin' ? <AdminIcon /> : <UserIcon />}
                                        label={t(`admin.users.roles.${user.role}`)}
                                        color={user.role === 'admin' ? 'primary' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.is_active ? t('admin.users.active') : t('admin.users.inactive')}
                                        color={user.is_active ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{user.last_login ? formatDate(user.last_login) : t('admin.users.never')}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title={t('admin.users.moreActions')}>
                                        <IconButton
                                            onClick={(e) => handleMenuOpen(e, user)}
                                            size="small"
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </motion.tr>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            )}

            {/* 用户编辑对话框 */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingUser ? t('admin.users.editUser') : t('admin.users.addUser')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label={t('admin.users.username')}
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label={t('admin.users.email')}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            type="email"
                            fullWidth
                            required
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label={t('admin.users.firstName')}
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label={t('admin.users.lastName')}
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                fullWidth
                            />
                        </Box>
                        <FormControl fullWidth>
                            <InputLabel>{t('admin.users.role')}</InputLabel>
                            <Select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                label={t('admin.users.role')}
                            >
                                <MenuItem value="user">{t('admin.users.roles.user')}</MenuItem>
                                <MenuItem value="admin">{t('admin.users.roles.admin')}</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>{t('admin.users.status')}</InputLabel>
                            <Select
                                value={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.value })}
                                label={t('admin.users.status')}
                            >
                                <MenuItem value={true}>{t('admin.users.active')}</MenuItem>
                                <MenuItem value={false}>{t('admin.users.inactive')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseDialog}>
                        {t('common.cancel')}
                    </Button>
                    <Button variant="contained" onClick={handleSaveUser}>
                        {t('common.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 操作菜单 */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => {
                    handleOpenDialog(selectedUser);
                    handleMenuClose();
                }}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('admin.users.edit')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleToggleUserStatus(selectedUser)}>
                    <ListItemIcon>
                        {selectedUser?.is_active ? <BlockIcon fontSize="small" /> : <ActivateIcon fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText>
                        {selectedUser?.is_active ? t('admin.users.deactivate') : t('admin.users.activate')}
                    </ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => handleDeleteUser(selectedUser.id)}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
                    </ListItemIcon>
                    <ListItemText>{t('admin.users.delete')}</ListItemText>
                </MenuItem>
            </Menu>
        </Box>
    );
}

export default UserManagement;
