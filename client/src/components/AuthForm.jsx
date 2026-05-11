import React, { useState } from "react";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { request } from '../utils/api.js';
import ForgotPassword from "./ForgotPassword.jsx";

const AuthForm = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await request(isLogin ? '/auth/login' : '/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (!isLogin) {
                setRegistered(true);
            } else {
                localStorage.setItem('token', data.token);
                onLogin(data.user);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (registered) {
        return (
            <div className='min-h-screen bg-parchment flex items-center justify-center p-4'>
                <div className='bg-card rounded-lg shadow-xl border-2 border-blush p-8 w-full max-w-md text-center'>
                    <BookOpen className='w-12 h-12 text-rose mx-auto mb-4' />
                    <h2 className='text-2xl font-serif text-burgundy mb-3'>Check your email!</h2>
                    <p className='text-rose mb-2'>We've sent a verification link to:</p>
                    <p className='text-burgundy font-medium mb-6'>{email}</p>
                    <p className='text-sm text-rose'>Click the link in the email to activate your account. Once verified, come back here to log in.</p>
                </div>
            </div>
        );
    }


    if (forgotPassword) {
        return <ForgotPassword onBack={() => setForgotPassword(false)} />;
    }

    return (
        <div className='min-h-screen bg-parchment flex items-center justify-center p-4'>
            <div className='bg-card rounded-lg shadow-xl border-2 border-blush p-8 w-full max-w-md'>

                <div className='text-center mb-8'>
                    <BookOpen className='w-12 h-12 text-rose mx-auto mb-3' />
                    <h1 className='text-3xl font-serif text-burgundy'>My Recipe Book</h1>
                    <p className='text-rose italic mt-1'>A collection of treasured recipes</p>
                </div>

                <div className='flex rounded-lg overflow-hidden border-2 border-blush mb-6'>
                    <button
                        onClick={() => { setIsLogin(true); setError(''); }}
                        className={`flex-1 py-2 font-medium transition ${
                            isLogin
                                ? 'bg-fig text-card'
                                : 'bg-card text-burgundy hover:bg-blush'
                        }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => { setIsLogin(false); setError(''); }}
                        className={`flex-1 py-2 font-medium transition ${
                            !isLogin
                                ? 'bg-fig text-card'
                                : 'bg-card text-burgundy hover:bg-blush'
                        }`}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label className='block text-burgundy font-medium mb-2'>
                            Email
                        </label>
                        <input
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full px-4 py-3 border-2 border-blush rounded-lg focus:border-rose focus:outline-none bg-card'
                            placeholder='your@email.com'
                            required
                        />
                    </div>

                    <div>
                        <label className='block text-burgundy font-medium mb-2'>
                            Password
                        </label>
                        <div className='relative'>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className='w-full px-4 py-3 border-2 border-blush rounded-lg focus:border-rose focus:outline-none bg-card pr-12'
                                placeholder='Minimum 8 characters'
                                required
                            />
                            <button
                                type='button'
                                onClick={() => setShowPassword(!showPassword)}
                                className='absolute right-3 top-1/2 -translate-y-1/2 text-rose hover:text-burgundy transition'
                            >
                                {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                            </button>
                        </div>
                    </div>

                    {isLogin && (
                        <div className='text-right'>
                            <button
                                type='button'
                                onClick={() => setForgotPassword(true)}
                                className='text-sm text-rose hover:text-burgundy transition'
                            >
                                Forgot password?
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className='px-4 py-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm'>
                            {error}
                        </div>
                    )}

                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full px-6 py-3 bg-rose-deep text-card rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthForm;