/**
 * LoginPage Component — Non-scrollable 100vh Layout Fit
 *
 * Features:
 * - Email & Password authentication with React Hook Form + Zod validation
 * - Quick Demo Login pill buttons (Customer, Venue Owner, Admin)
 * - Social login integration buttons (Google & Apple)
 * - Password visibility toggle & Remember me checkbox
 * - Compact fit to ensure zero scrollbars on desktop viewports
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Shield, Building2, User, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

import { loginUser } from '../redux/authThunks';
import { selectAuthStatus } from '../redux/authSlice';
import { loginSchema } from '../validation/authValidation';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const authStatus = useSelector(selectAuthStatus);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(loginUser(data)).unwrap();
      const user = result?.user || result?.data?.user;
      const role = user?.role;

      toast.success(`Welcome back, ${user?.name || 'User'}!`);

      // Role-based redirection
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'owner') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error(err?.message || 'Login failed. Please check your credentials.');
    }
  };

  // Quick fill helper for demo login
  const handleQuickFill = (email, password, roleName) => {
    setValue('email', email);
    setValue('password', password);
    toast.success(`Demo credentials filled for ${roleName}`);
  };

  return (
    <div
      className="card glass"
      style={{
        background: 'var(--surface-1)',
        borderRadius: 20,
        padding: '24px 28px',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.04)',
        border: '1px solid var(--border-subtle)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Title & Subtitle */}
      <div style={{ marginBottom: 14, textAlign: 'left' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', margin: 0 }}>
          Welcome back
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2, marginBottom: 0 }}>
          Enter your details to access your account
        </p>
      </div>

      {/* Demo Quick Accounts Bar */}
      <div style={{
        background: 'var(--bg-subtle)',
        padding: '10px 12px',
        borderRadius: 14,
        border: '1px solid var(--border-subtle)',
        marginBottom: 14,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Zap size={12} fill="currentColor" /> Quick Demo Login
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          <button
            type="button"
            onClick={() => handleQuickFill('customer1@venuehub.in', 'Customer@123456', 'Customer')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: 11, padding: '6px 4px', gap: 4, borderRadius: 8, justifyContent: 'center' }}
          >
            <User size={13} style={{ color: 'var(--brand-default)' }} />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('owner1@venuehub.in', 'Owner@123456', 'Venue Owner')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: 11, padding: '6px 4px', gap: 4, borderRadius: 8, justifyContent: 'center' }}
          >
            <Building2 size={13} style={{ color: '#c084fc' }} />
            <span>Owner</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('admin@venuehub.in', 'Admin@123456', 'Admin')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: 11, padding: '6px 4px', gap: 4, borderRadius: 8, justifyContent: 'center' }}
          >
            <Shield size={13} style={{ color: '#38bdf8' }} />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        
        {/* Email Field */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              className={`input ${errors.email ? 'input-error' : ''}`}
              style={{ paddingLeft: 38, height: 40, borderRadius: 10, fontSize: 13 }}
            />
          </div>
          {errors.email && (
            <span style={{ fontSize: 11, color: 'var(--color-error-500)', marginTop: 2, display: 'block' }}>
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
              Password
            </label>
            <Link to="/auth/forgot-password" style={{ fontSize: 12, color: 'var(--brand-default)', fontWeight: 700, textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={`input ${errors.password ? 'input-error' : ''}`}
              style={{ paddingLeft: 38, paddingRight: 38, height: 40, borderRadius: 10, fontSize: 13 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <span style={{ fontSize: 11, color: 'var(--color-error-500)', marginTop: 2, display: 'block' }}>
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ width: 14, height: 14, accentColor: '#6344f5', cursor: 'pointer' }}
          />
          <label htmlFor="rememberMe" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Remember me
          </label>
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={authStatus === 'loading'}
          className="btn btn-primary btn-lg"
          style={{
            width: '100%',
            height: 42,
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            background: 'linear-gradient(135deg, #6344f5 0%, #7c3aed 100%)',
            color: '#ffffff',
            gap: 6,
            boxShadow: '0 6px 16px rgba(99, 68, 245, 0.3)',
            marginTop: 2,
          }}
        >
          {authStatus === 'loading' ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
        </button>

        {/* Social Login Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>or continue with</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
        </div>

        {/* Social Login Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            type="button"
            onClick={() => toast.success('Google authentication...')}
            className="btn btn-secondary"
            style={{ height: 38, borderRadius: 10, fontSize: 12, fontWeight: 600, gap: 6, justifyContent: 'center' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={() => toast.success('Apple authentication...')}
            className="btn btn-secondary"
            style={{ height: 38, borderRadius: 10, fontSize: 12, fontWeight: 600, gap: 6, justifyContent: 'center' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.17c.68-.83 1.14-1.99 1.01-3.17-1.01.04-2.22.67-2.93 1.5-.63.73-1.18 1.91-1.03 3.06 1.13.09 2.28-.56 2.95-1.39z" />
            </svg>
            <span>Continue with Apple</span>
          </button>
        </div>

        {/* Footer Registration Link */}
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, marginBottom: 0 }}>
          Don't have an account?{' '}
          <Link to="/auth/register" style={{ color: '#6344f5', fontWeight: 700, textDecoration: 'none' }}>
            Create Account
          </Link>
        </p>

      </form>
    </div>
  );
};

export default LoginPage;
