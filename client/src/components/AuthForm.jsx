import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import { request } from '../utils/api.js';

const AuthForm = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await request(isLogin ? '/auth/login' : '/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            localStorage.setItem('token', data.token);
            onLogin(data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
   };

   return (
    <div className='min-h-screen bg-amber-50 flex items-center justify-center p-4'>
        <div className='bg-white rounded-lg shadow-xl border-2 border-amber-200 p-8 w-full max-w-md'>

            <div className='text-center mb-8'>
                <BookOpen className='w-12 h-12 text-amber-700 mx-auto mb-3' />
                <h1 className='text-3xl font-serif text-amber-900'>My Recipe Book</h1>
                <p className='text-amber-600 italic mt-1'>A collection of tresured recipes</p>
            </div>

            <div className='flex rounded-lg overflow-hidden border-2 border-amber-200 mb-6'>
                <button
                    onClick={() => { setIsLogin(true); setError(''); }}
                    className={`flex-1 py-2 font-medium transition ${
                        isLogin
                            ? 'bg-amber-600 text-white'
                            : 'bg-white text-amber-700 hover:bg-ammber-50'
                    }`}
                >
                    Login
                </button>

                <button
                    onClick={() => { setIsLogin(false); setError(''); }}
                    className={`flex-1 py-2 font-medium transition ${
                        !isLogin
                            ? 'bg-amber-600 text-white'
                            : 'bg-white text-amber-700 hover:bg-amber-50'
                    }`}
                >
                    Register
                </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                    <label className='block text-amber-900 font-medium mb-2'>
                        Email
                    </label>
                    <input
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none'
                        placeholder='your@email.com'
                        required
                    />
                </div>

                <div>
                    <label className='block text-amber-900 font-medium mb-2'>
                        Password
                    </label>
                    <input
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none'
                        placeholder='Minimum 8 characters'
                        required
                    />
                </div>

                {error && (
                    <div className='px-4 py-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm'>
                        {error}
                    </div>
                )}

                <button
                    type='submit'
                    disabled={loading}
                    className='w-full px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
                </button>
            </form>
        </div>
    </div>
   );
};

export default AuthForm;
