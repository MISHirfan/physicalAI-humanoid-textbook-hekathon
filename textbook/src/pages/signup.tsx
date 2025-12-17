import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { useAuth } from '../theme/AuthContext';
import { useHistory } from '@docusaurus/router';
import axios from 'axios';

export default function Signup() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        gpu: 'None',
        ros_level: 'Beginner',
        programming_level: 'Beginner'
    });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const history = useHistory();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const backendUrl = 'http://localhost:8000';
            const res = await axios.post(`${backendUrl}/auth/signup`, formData);

            if (res.data && res.data.user_id) {
                // Auto login after signup
                login({ email: formData.email, name: formData.full_name });
                history.push('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Signup failed');
        }
    };

    return (
        <Layout title="Sign Up" description="Create an account">
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh',
                padding: '2rem'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '500px',
                    padding: '2rem',
                    border: '1px solid var(--ifm-color-emphasis-200)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Create Account</h1>
                    {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Full Name</label>
                            <input name="full_name" required onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Email</label>
                            <input type="email" name="email" required onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Password</label>
                            <input type="password" name="password" required onChange={handleChange} style={inputStyle} />
                        </div>

                        <hr style={{ margin: '1.5rem 0' }} />
                        <h3 style={{ marginBottom: '1rem' }}>Background Profile</h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label>What GPU do you have available?</label>
                            <select name="gpu" onChange={handleChange} style={inputStyle}>
                                <option value="None">None (CPU only)</option>
                                <option value="NVIDIA RTX 30/40 Series">NVIDIA RTX 30/40 Series</option>
                                <option value="NVIDIA T4/A10 (Cloud)">NVIDIA T4/A10 (Cloud)</option>
                                <option value="Mac M1/M2/M3">Mac M1/M2/M3</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label>ROS 2 Experience Level</label>
                            <select name="ros_level" onChange={handleChange} style={inputStyle}>
                                <option value="Beginner">Beginner (New to Robotics)</option>
                                <option value="Intermediate">Intermediate (Used ROS1/ROS2 before)</option>
                                <option value="Advanced">Advanced (Contributor/Maintainer)</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label>Programming Level (Python/C++)</label>
                            <select name="programming_level" onChange={handleChange} style={inputStyle}>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        <button type="submit" style={buttonStyle}>Sign Up</button>
                    </form>
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        Already have an account? <a href="/login">Login</a>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginTop: '0.25rem'
};

const buttonStyle = {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'var(--ifm-color-success)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '1rem'
};
