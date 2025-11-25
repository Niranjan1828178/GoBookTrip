import React from 'react';

export default function Guides() {
  const guides = [
    { title: 'Packing Essentials', desc: 'What to pack for different climates.' },
    { title: 'Budgeting Tips', desc: 'Save smartly for your next trip.' },
    { title: 'Local Etiquette', desc: 'Respectful travel practices.' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Travel Guides</h1>
      <div className="space-y-4">
        {guides.map(g => (
          <div key={g.title} className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
            <div className="font-semibold text-slate-900">{g.title}</div>
            <div className="text-sm text-slate-600 mt-1">{g.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}