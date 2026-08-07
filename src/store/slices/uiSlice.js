/**
 * UI Slice — Global UI State
 *
 * Manages:
 * - Theme (light/dark)
 * - Sidebar state
 * - Modal registry
 * - Global loading overlay
 * - Search panel state
 */

import { createSlice } from '@reduxjs/toolkit';
import { THEME_STORAGE_KEY, THEMES } from '@constants/index';

// Read persisted theme from localStorage
const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === THEMES.DARK || saved === THEMES.LIGHT) return saved;
    // System preference fallback
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return THEMES.DARK;
  } catch {}
  return THEMES.LIGHT;
};

const initialState = {
  theme: getInitialTheme(),
  isSidebarOpen: false,
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isGlobalLoading: false,
  modals: {}, // { [modalId]: { isOpen: boolean, props: any } }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // ── Theme ──
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem(THEME_STORAGE_KEY, action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
    },
    toggleTheme: (state) => {
      const next = state.theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
      state.theme = next;
      localStorage.setItem(THEME_STORAGE_KEY, next);
      document.documentElement.setAttribute('data-theme', next);
    },

    // ── Navigation ──
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setMobileMenuOpen: (state, action) => {
      state.isMobileMenuOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },

    // ── Search Panel ──
    setSearchOpen: (state, action) => {
      state.isSearchOpen = action.payload;
    },

    // ── Global Loading ──
    setGlobalLoading: (state, action) => {
      state.isGlobalLoading = action.payload;
    },

    // ── Modal Registry ──
    openModal: (state, action) => {
      const { id, props = {} } = action.payload;
      state.modals[id] = { isOpen: true, props };
    },
    closeModal: (state, action) => {
      const id = action.payload;
      if (state.modals[id]) {
        state.modals[id].isOpen = false;
        state.modals[id].props = {};
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((id) => {
        state.modals[id] = { isOpen: false, props: {} };
      });
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  setMobileMenuOpen,
  toggleMobileMenu,
  setSearchOpen,
  setGlobalLoading,
  openModal,
  closeModal,
  closeAllModals,
} = uiSlice.actions;

// ─── Selectors ──────────────────────────────────────────────────────────────
export const selectTheme           = (state) => state.ui.theme;
export const selectIsDarkTheme     = (state) => state.ui.theme === THEMES.DARK;
export const selectIsSidebarOpen   = (state) => state.ui.isSidebarOpen;
export const selectIsMobileMenuOpen = (state) => state.ui.isMobileMenuOpen;
export const selectIsSearchOpen    = (state) => state.ui.isSearchOpen;
export const selectIsGlobalLoading = (state) => state.ui.isGlobalLoading;
export const selectModal           = (id) => (state) => state.ui.modals[id] || { isOpen: false, props: {} };

export default uiSlice.reducer;
