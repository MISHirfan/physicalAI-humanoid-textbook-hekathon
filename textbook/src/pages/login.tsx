import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { useAuth } from '../theme/AuthContext';
import { useHistory } from '@docusaurus/router';
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const history = useHistory();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Allow configurable backend URL
            const backendUrl = 'http://localhost:8000';
            const res = await axios.post(`${backendUrl}/auth/signin`, { email, password });

            if (res.data && res.data.user) {
                login(res.data.user);
                history.push('/'); // Redirect to home
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed');
        }
    };

    return (
        <Layout title="Login" description="Login to Physical AI Textbook">
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '50vh',
                padding: '2rem'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '2rem',
                    border: '1px solid var(--ifm-color-emphasis-200)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Login</h1>
                    {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: 'var(--ifm-color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Sign In
                        </button>
                    </form>
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        Don't have an account? <a href="/signup">Sign up</a>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
