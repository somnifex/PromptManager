import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { restoreAuth, fetchCurrentUser } from './slices/authSlice';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PromptForm from './components/PromptForm';
import PromptDetail from './components/PromptDetail';
import Layout from './components/Layout';
import UserProfile from './components/UserProfile';
import UserSettings from './components/UserSettings';
import AdminDashboard from './components/Admin/AdminDashboard';
import './i18n';

function App() {
  const dispatch = useDispatch();
  const { token, user, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    // 在应用初始化时恢复认证状态
    dispatch(restoreAuth());
    
    // 如果有token但没有用户信息，自动获取用户信息
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && (!storedUser || storedUser === 'null')) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  // 如果正在加载且有token，显示加载状态
  if (isLoading && token) {
    return (
      <ThemeContextProvider>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          Loading...
        </div>
      </ThemeContextProvider>
    );
  }

  return (
    <ThemeContextProvider>
      {!token ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/prompts/new" element={<PromptForm />} />
            <Route path="/prompts/:id" element={<PromptDetail />} />
            <Route path="/prompts/:id/edit" element={<PromptForm />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/settings" element={<UserSettings />} />
            {user?.role === 'admin' && (
              <Route path="/admin" element={<AdminDashboard />} />
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </ThemeContextProvider>
  );
}

export default App;