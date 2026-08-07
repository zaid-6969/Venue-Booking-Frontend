/**
 * ResetPasswordPage Component
 *
 * Features:
 * - Query param token extraction
 * - New password & confirm password inputs
 * - React Hook Form + Zod validation
 * - Redux resetPassword thunk integration
 */

import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { resetPassword } from '../redux/authThunks';
import { selectResetStatus } from '../redux/authSlice';
import { resetPasswordSchema } from '../validation/authValidation';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const resetStatus = useSelector(selectResetStatus);

  const [showPassword, setShowPassword] = useState(false);
  const token = searchParams.get('token') || 'dummy-token';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data) => {
    try {
      await dispatch(resetPassword({ token, password: data.password })).unwrap();
      toast.success('Password reset successfully! Please sign in with your new password.');
      navigate('/auth/login');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password. Token may be invalid or expired.');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: 'var(--space-6)', textAlign: 'left' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          Reset your password
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Enter a strong new password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        
        {/* New Password */}
        <div>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
            New Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 8 characters"
              {...register('password')}
              className={`input ${errors.password ? 'input-error' : ''}`}
              style={{ paddingLeft: 42, paddingRight: 42 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error-500)', marginTop: 4, display: 'block' }}>
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
            Confirm New Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter new password"
              {...register('confirmPassword')}
              className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
              style={{ paddingLeft: 42 }}
            />
          </div>
          {errors.confirmPassword && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error-500)', marginTop: 4, display: 'block' }}>
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={resetStatus === 'loading'}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', borderRadius: 'var(--radius-xl)', fontWeight: 700, gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}
        >
          {resetStatus === 'loading' ? 'Resetting Password...' : 'Reset Password'} <ArrowRight size={18} />
        </button>

      </form>
    </div>
  );
};

export default ResetPasswordPage;
