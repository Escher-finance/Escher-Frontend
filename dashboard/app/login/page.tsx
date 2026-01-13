'use client';

import { useAuth } from '@/components/provider/auth';
import { useState } from 'react';

export default function LoginPage() {
    const { login } = useAuth()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (error) {
            setError(String(error));
        }
    };

    return (
        <div className='container mx-auto flex items-center justify-center h-screen text-sky-100'>
            <form onSubmit={handleSubmit} className='flex flex-col'>
                <div className='text-2xl font-semibold'>Login</div>
                <input
                    type="text"
                    placeholder="Email / Username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className='border rounded p-2 mt-4'
                /><br />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className='border rounded p-2'
                /><br />
                <button type="submit" className='px-4 py-2 bg-sky-700 hover:bg-sky-500 transition-all text-sky-50 font-semibold rounded cursor-pointer'>Login</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
}
