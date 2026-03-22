'use client'

import React from 'react'

type AdminPaginatorProps = {
  page: number
  totalPages: number
  pageSize: number
  totalDocs: number
  pagingCounter?: number
  labels: {
    pageLabel: string
    ofLabel: string
    perPageLabel: string
  }
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
}

export function AdminPaginator({
  page,
  totalPages,
  pageSize,
  totalDocs,
  pagingCounter,
  labels,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
}: AdminPaginatorProps) {
  if (totalPages <= 0) return null

  const start = pagingCounter ?? (page - 1) * pageSize + 1
  const end = Math.min(start + pageSize - 1, totalDocs)

  const canGoPrev = page > 1
  const canGoNext = page < totalPages

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="admin-pagination">
      <div className="admin-pagination__bar">
        <div className="admin-pagination__left">
          <button
            type="button"
            className="admin-pagination__icon-button admin-pagination__icon-button--prev"
            disabled={!canGoPrev}
            onClick={() => canGoPrev && onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 2L4 7l5 5" />
            </svg>
          </button>

          {pages.map((p) => {
            const isActive = p === page
            return (
              <button
                key={p}
                type="button"
                className={
                  isActive
                    ? 'admin-pagination__page-button admin-pagination__page-button--active'
                    : 'admin-pagination__page-button'
                }
                onClick={() => onPageChange(p)}
                aria-current={isActive ? 'page' : undefined}
              >
                {p}
              </button>
            )
          })}

          <button
            type="button"
            className="admin-pagination__icon-button admin-pagination__icon-button--next"
            disabled={!canGoNext}
            onClick={() => canGoNext && onPageChange(page + 1)}
            aria-label="Next page"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 2l5 5-5 5" />
            </svg>
          </button>
        </div>

        <div className="admin-pagination__right">
          <span className="admin-pagination__range">
            {start}-{end} {labels.ofLabel} {totalDocs}
          </span>

          {onPageSizeChange && (
            <div className="admin-pagination__per-page">
              <span className="admin-pagination__per-page-label">
                {labels.perPageLabel}: {pageSize}
              </span>

              <svg
                className="admin-pagination__per-page-icon"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M3.5 5.5 7 9l3.5-3.5" />
              </svg>

              <select
                className="admin-pagination__per-page-select"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                aria-label="Change items per page"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
