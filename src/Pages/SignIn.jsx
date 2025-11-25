import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function SignIn({ onLogin }) {
  const email= useRef('');
  const password= useRef('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const emailValue = email.current.value;
      const res = await api.get('/users', { params: { emailValue } });
      const users = Array.isArray(res.data) ? res.data : [];
      const user = users.find(u => u.password === password.current.value);
      console.log(users);
      if (user) {
        onLogin(user);
        nav('/'); 
      } else {
        alert('Invalid email or password');
      }
    } catch (err) {
      console.error(err);
      const msg = err?.response?.status
        ? `Sign in failed (server responded ${err.response.status})`
        : 'Sign in failed (could not reach API )';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold mb-4">Sign In</h2>
      <form onSubmit={submit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input className="w-full px-3 py-2 border border-slate-200 rounded-md mb-4" ref={email}  required />
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <input type="password" className="w-full px-3 py-2 border border-slate-200 rounded-md mb-4" ref={password} required />
        <button className="w-full py-2 bg-indigo-600 text-white rounded-md" disabled={loading}>{loading ? 'Signing...' : 'Sign In'}</button>
      </form>
    </div>
  );
}
