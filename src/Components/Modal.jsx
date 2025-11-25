import React from 'react';

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50">
      <div
        className="relative w-full max-w-lg sm:max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-end p-3 border-b border-slate-100">
          <button
            onClick={onClose}
            className="p-2 rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}