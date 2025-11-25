import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function SignUp({ onSignUp }) {
  const name = useRef('');
  const email = useRef('');
  const password = useRef('');
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const emailValue = email.current.value;
      const nameValue =name.current.value;
      const passwordValue=password.current.value;
      const res = await api.get('/users', { params: { email } });
      const users = Array.isArray(res.data) ? res.data : [];
      // console.log("Signup",users);
      if (users.length) {
        alert('User already exists');
        setLoading(false);
        return;
      }
      const create = await api.post('/users', { nameValue, emailValue, passwordValue });
      onSignUp(create.data);
      nav('/');
    } catch (err) {
      console.error(err);
      const msg = err?.response?.status
        ? `Sign up failed (server responded ${err.response.status})`
        : 'Sign up failed (could not reach API )';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold mb-4">Create Account</h2>
      <form onSubmit={submit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <label className="block text-sm font-medium text-slate-700">Full name</label>
        <input className="w-full px-3 py-2 border border-slate-200 rounded-md mb-4" ref={name} required />
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input className="w-full px-3 py-2 border border-slate-200 rounded-md mb-4" ref={email} required />
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <input type="password" className="w-full px-3 py-2 border border-slate-200 rounded-md mb-4" ref={password}  required />
        <button className="w-full py-2 bg-indigo-600 text-white rounded-md" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
      </form>
    </div>
  );
}