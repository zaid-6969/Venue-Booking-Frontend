/**
 * ForgotPasswordPage Component
 *
 * Features:
 * - Single email input form
 * - React Hook Form + Zod validation
 * - Confirmation alert state with mock email sent message
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { forgotPassword } from '../redux/authThunks';
import { selectForgotStatus } from '../redux/authSlice';
import { forgotPasswordSchema } from '../validation/authValidation';

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const forgotStatus = useSelector(selectForgotStatus);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    try {
      await dispatch(forgotPassword(data.email)).unwrap();
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      toast.success('Password reset link sent!');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link. Please verify your email.');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {isSubmitted ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-success-50)', color: 'var(--color-success-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4) auto' }}>
            <CheckCircle2 size={36} />
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
            Check your email
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>
            We've sent password reset instructions to <br />
            <strong style={{ color: 'var(--text-primary)' }}>{submittedEmail}</strong>
          </p>

          <Link to="/auth/login" className="btn btn-secondary" style={{ width: '100%', gap: 'var(--space-2)' }}>
            <ArrowLeft size={16} /> Return to Login
          </Link>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 'var(--space-6)', textAlign: 'left' }}>
            <Link to="/auth/login" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 'var(--space-4)', textDecoration: 'none' }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Forgot password?
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: 6 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  style={{ paddingLeft: 42 }}
                />
              </div>
              {errors.email && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error-500)', marginTop: 4, display: 'block' }}>
                  {errors.email.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={forgotStatus === 'loading'}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', borderRadius: 'var(--radius-xl)', fontWeight: 700, gap: 'var(--space-2)' }}
            >
              {forgotStatus === 'loading' ? 'Sending link...' : 'Send Reset Link'} <ArrowRight size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
