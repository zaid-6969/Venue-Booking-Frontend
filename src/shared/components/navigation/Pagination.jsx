/**
 * Pagination Component — Reusable Server-Side Pagination
 *
 * Provides page numbering with smart ellipsis, previous/next controls,
 * rows-per-page selection, record range display, and loading state integration.
 */

import React from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const Pagination = ({
  page = 1,
  limit = 20,
  total = 0,
  totalPages = 1,
  onPageChange,
  onLimitChange,
  loading = false,
  limitOptions = [10, 20, 50],
}) => {
  if (total === 0 && totalPages <= 1) {
    return null;
  }

  const startRecord = total > 0 ? (page - 1) * limit + 1 : 0;
  const endRecord = total > 0 ? Math.min(page * limit, total) : 0;

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        padding: '16px 20px',
        background: 'var(--surface-1)',
        borderRadius: 16,
        border: '1px solid var(--border-subtle)',
        marginTop: 8,
      }}
    >
      {/* Left: Record Range Summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b' }}>
        {loading && <Loader2 size={14} className="animate-spin" style={{ color: '#6344f5' }} />}
        <span>
          Showing <strong style={{ color: '#0f172a' }}>{startRecord}–{endRecord}</strong> of{' '}
          <strong style={{ color: '#0f172a' }}>{total}</strong> records
        </span>
      </div>

      {/* Center: Page Number Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Previous Button */}
        <button
          onClick={() => onPageChange && onPageChange(page - 1)}
          disabled={page <= 1 || loading}
          className="btn btn-secondary btn-sm"
          style={{
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 700,
            gap: 4,
            opacity: page <= 1 || loading ? 0.45 : 1,
            cursor: page <= 1 || loading ? 'not-allowed' : 'pointer',
          }}
          title="Previous Page"
        >
          <ChevronLeft size={14} /> Previous
        </button>

        {/* Page Numbers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, margin: '0 4px' }}>
          {pageNumbers.map((num, idx) => {
            if (num === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  style={{
                    padding: '0 6px',
                    color: '#94a3b8',
                    fontSize: 13,
                    fontWeight: 700,
                    userSelect: 'none',
                  }}
                >
                  …
                </span>
              );
            }

            const isCurrent = num === page;

            return (
              <button
                key={`page-${num}`}
                onClick={() => onPageChange && onPageChange(num)}
                disabled={loading || isCurrent}
                style={{
                  minWidth: 32,
                  height: 32,
                  padding: '0 8px',
                  borderRadius: 8,
                  border: isCurrent ? '1px solid #6344f5' : '1px solid var(--border-subtle)',
                  background: isCurrent ? '#6344f5' : 'var(--bg-subtle)',
                  color: isCurrent ? '#ffffff' : '#334155',
                  fontWeight: isCurrent ? 800 : 600,
                  fontSize: 12,
                  cursor: isCurrent || loading ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange && onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
          className="btn btn-secondary btn-sm"
          style={{
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 700,
            gap: 4,
            opacity: page >= totalPages || loading ? 0.45 : 1,
            cursor: page >= totalPages || loading ? 'not-allowed' : 'pointer',
          }}
          title="Next Page"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>

      {/* Right: Rows per page selector */}
      {onLimitChange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Rows per page:</span>
          <select
            value={limit}
            onChange={(e) => {
              onLimitChange(Number(e.target.value));
            }}
            disabled={loading}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-subtle)',
              fontSize: 12,
              color: '#0f172a',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {limitOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default Pagination;
