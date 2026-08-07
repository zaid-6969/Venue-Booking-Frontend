/**
 * App.jsx — Application Root
 *
 * Responsibilities:
 * - Initialize theme on app start
 * - Check auth status on first load (fetchCurrentUser)
 * - Provide Redux store via Provider
 * - Mount React Router
 * - Mount React Hot Toast
 * - Listen for auth:logout events from apiClient
 */
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import router from '@lib/router';
import { fetchCurrentUser } from '@features/auth/redux/authThunks';
import { logoutUser }       from '@features/auth/redux/authThunks';
import { selectTheme }      from '@store/slices/uiSlice';
import { ACCESS_TOKEN_KEY } from '@constants/index';
import '@styles/globals.css';

// Google Fonts — loaded dynamically to avoid render blocking
const loadFonts = () => {
  const link = document.createElement('link');
  link.rel  = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
  document.head.appendChild(link);
};

const App = () => {
  const dispatch = useDispatch();
  const theme    = useSelector(selectTheme);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Load Google Fonts
    loadFonts();

    // Check auth on app init (only if token exists)
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      dispatch(fetchCurrentUser());
    } else {
      // Mark as initialized even without a token
      // so route guards don't block forever
      dispatch({ type: 'auth/setInitialized' });
    }

    // Listen for forced logout events from apiClient (401 with no refresh)
    const handleForcedLogout = () => {
      dispatch(logoutUser());
    };

    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, [dispatch]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{ zIndex: 'var(--z-toast)' }}
        toastOptions={{
          duration: 4000,
          style: {
            background:  'var(--surface-1)',
            color:       'var(--text-primary)',
            border:      '1px solid var(--border-normal)',
            borderRadius: 'var(--radius-lg)',
            boxShadow:   'var(--shadow-lg)',
            fontFamily:  'var(--font-sans)',
            fontSize:    'var(--text-sm)',
            maxWidth:    380,
          },
          success: {
            iconTheme: { primary: 'var(--color-success-500)', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: 'var(--color-error-500)', secondary: '#fff' },
          },
        }}
      />
    </>
  );
};

export default App;
