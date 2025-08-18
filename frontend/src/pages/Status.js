import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

export default function Status() {
  const { user } = useAuth();
  const [data, setData] = useState({ online: [], offline: [] });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const markOnline = async () => {
    if (!token) return;
    await fetch(`${API_BASE_URL}/api/presence/online`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
  };

  const markOffline = async () => {
    if (!token) return;
    await fetch(`${API_BASE_URL}/api/presence/offline`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
  };

  const fetchSummary = async () => {
    if (!token) return;
    const res = await fetch(`${API_BASE_URL}/api/presence/summary`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    setData({ online: json.online || [], offline: json.offline || [] });
  };

  useEffect(() => {
    // Mark online when page mounts, offline when unmounts
    markOnline();
    fetchSummary();
    const t = setInterval(fetchSummary, 10000);
    return () => {
      clearInterval(t);
      markOffline();
    };
  }, []);

  return (
    <div style={{ padding: 24, backgroundColor: '#1e1e1e', minHeight: '100vh', color: 'white' }}>
      <h2 style={{ marginTop: 0 }}>User Presence</h2>
      <p style={{ color: '#aaa' }}>A simple view of online and offline users.</p>
      <div style={{ display: 'flex', gap: 32 }}>
        <div style={{ flex: 1 }}>
          <h4>Online</h4>
          {data.online.length === 0 ? (
            <div style={{ color: '#aaa' }}>No one is online</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {data.online.map(u => (
                <li key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  <span>{u.username || u.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h4>Offline</h4>
          {data.offline.length === 0 ? (
            <div style={{ color: '#aaa' }}>Everyone is online</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {data.offline.map(u => (
                <li key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#9ca3af', display: 'inline-block' }} />
                  <span>{u.username || u.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}


