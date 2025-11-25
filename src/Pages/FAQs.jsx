import React from 'react';

const faqs = [
  { q: 'How do I book a trip?', a: 'Open a trip and use the Book button. Sign in is required.' },
  { q: 'Can I cancel my booking?', a: 'Yes — open Profile, view booking details and cancel.' },
  { q: 'Where do payments go?', a: 'This demo uses a local JSON server; integrate a payments provider for production.' },
];

export default function FAQs() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">FAQs</h1>
      <div className="space-y-4">
        {faqs.map(f => (
          <div key={f.q} className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
            <div className="font-medium text-slate-900">{f.q}</div>
            <div className="text-sm text-slate-600 mt-1">{f.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}