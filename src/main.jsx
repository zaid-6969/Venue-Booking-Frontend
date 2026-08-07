/**
 * Application Entry Point
 * Wraps App in Redux Provider and React StrictMode
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/index.js';
import App from './App.jsx';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found. Ensure index.html has <div id="root"></div>');
}

createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
