/**
 * RegisterPage Component — Matches Auth UI Design System
 *
 * Features:
 * - Role selector tabs (Customer vs Venue Owner)
 * - Full account registration form (Name, Email, Phone, Password, Confirm Password)
 * - React Hook Form + Zod validation schema
 * - Real-time password match indicators
 * - Redux registerUser integration
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight, Building2, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

import { registerUser } from '../redux/authThunks';
import { selectAuthStatus } from '../redux/authSlice';
import { registerSchema } from '../validation/authValidation';

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authStatus = useSelector(selectAuthStatus);

  const [selectedRole, setSelectedRole] = useState('customer'); // 'customer' | 'owner'
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'customer',
    },
  });

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(registerUser(data)).unwrap();
      const user = result?.user || result?.data?.user;
      const role = user?.role || selectedRole;

      toast.success('Registration successful! Welcome to EventFlow.');
      
      if (role === 'owner') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error(err?.message || 'Registration failed. Email may already be in use.');
    }
  };

  return (
    <div
      className="card glass"
      style={{
        background: 'var(--surface-1)',
        borderRadius: 24,
        padding: '36px 40px',
        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.05)',
        border: '1px solid var(--border-subtle)',
        width: '100%',
      }}
    >
      {/* Title */}
      <div style={{ marginBottom: 20, textAlign: 'left' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
          Create an account
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          Join EventFlow to book venues or list your property
        </p>
      </div>

      {/* Role Toggle Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, background: 'var(--bg-subtle)', padding: 4, borderRadius: 16, marginBottom: 20, border: '1px solid var(--border-subtle)' }}>
        <button
          type="button"
          onClick={() => handleRoleChange('customer')}
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: 'none',
            background: selectedRole === 'customer' ? 'var(--surface-1)' : 'transparent',
            color: selectedRole === 'customer' ? '#6344f5' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: selectedRole === 'customer' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.2s ease',
          }}
        >
          <UserCheck size={16} /> Book Venues
        </button>

        <button
          type="button"
          onClick={() => handleRoleChange('owner')}
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: 'none',
            background: selectedRole === 'owner' ? 'var(--surface-1)' : 'transparent',
            color: selectedRole === 'owner' ? '#6344f5' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: selectedRole === 'owner' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.2s ease',
          }}
        >
          <Building2 size={16} /> List Venue
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Hidden Role Input */}
        <input type="hidden" {...register('role')} value={selectedRole} />

        {/* Full Name */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
            Full Name
          </label>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Ananya Sharma"
              {...register('name')}
              className={`input ${errors.name ? 'input-error' : ''}`}
              style={{ paddingLeft: 42, height: 44, borderRadius: 12, fontSize: 14 }}
            />
          </div>
          {errors.name && (
            <span style={{ fontSize: 12, color: 'var(--color-error-500)', marginTop: 4, display: 'block' }}>
              {errors.name.message}
            </span>
          )}
        </div>

        {/* Email */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              className={`input ${errors.email ? 'input-error' : ''}`}
              style={{ paddingLeft: 42, height: 44, borderRadius: 12, fontSize: 14 }}
            />
          </div>
          {errors.email && (
            <span style={{ fontSize: 12, color: 'var(--color-error-500)', marginTop: 4, display: 'block' }}>
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Phone */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
            Mobile Number (Optional)
          </label>
          <div style={{ position: 'relative' }}>
            <Phone size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="tel"
              placeholder="9876543210"
              {...register('phone')}
              className={`input ${errors.phone ? 'input-error' : ''}`}
              style={{ paddingLeft: 42, height: 44, borderRadius: 12, fontSize: 14 }}
            />
          </div>
          {errors.phone && (
            <span style={{ fontSize: 12, color: 'var(--color-error-500)', marginTop: 4, display: 'block' }}>
              {errors.phone.message}
            </span>
          )}
        </div>

        {/* Password */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 8 characters"
              {...register('password')}
              className={`input ${errors.password ? 'input-error' : ''}`}
              style={{ paddingLeft: 42, paddingRight: 42, height: 44, borderRadius: 12, fontSize: 14 }}
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
            <span style={{ fontSize: 12, color: 'var(--color-error-500)', marginTop: 4, display: 'block' }}>
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
            Confirm Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              {...register('confirmPassword')}
              className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
              style={{ paddingLeft: 42, height: 44, borderRadius: 12, fontSize: 14 }}
            />
          </div>
          {errors.confirmPassword && (
            <span style={{ fontSize: 12, color: 'var(--color-error-500)', marginTop: 4, display: 'block' }}>
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={authStatus === 'loading'}
          className="btn btn-primary btn-lg"
          style={{
            width: '100%',
            height: 48,
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 15,
            background: 'linear-gradient(135deg, #6344f5 0%, #7c3aed 100%)',
            color: '#ffffff',
            gap: 8,
            boxShadow: '0 8px 20px rgba(99, 68, 245, 0.3)',
            marginTop: 8,
          }}
        >
          {authStatus === 'loading' ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
        </button>

        {/* Footer Link */}
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>
          Already have an account?{' '}
          <Link to="/auth/login" style={{ color: '#6344f5', fontWeight: 700, textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>

      </form>
    </div>
  );
};

export default RegisterPage;
