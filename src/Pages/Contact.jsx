import React, { useState } from 'react';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(()=>setSent(false), 1800);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>

      <form onSubmit={submit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <label className="block text-sm font-medium text-slate-700">Name</label>
        <input className="w-full px-3 py-2 border border-slate-200 rounded-md mb-3" required />

        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input type="email" className="w-full px-3 py-2 border border-slate-200 rounded-md mb-3" required />

        <label className="block text-sm font-medium text-slate-700">Message</label>
        <textarea className="w-full px-3 py-2 border border-slate-200 rounded-md mb-4" rows="4" required />

        <button className="w-full py-2 bg-indigo-600 text-white rounded-md" type="submit">{sent ? 'Sent' : 'Send Message'}</button>
      </form>
    </div>
  );
}