import React, { useState } from "react";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { request } from "../utils/api";

const ResetPassword = ({ onComplete }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const token = new URLSearchParams(window.location.search).get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords don't match.");
            return;
        }

        setLoading(true);

        try {
            await request(`/auth/reset-password/${token}`, {
                method: 'POST',
                body: JSON.stringify({ password })
            });
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className='min-h-screen bg-parchment flex items-center justify-center p-4'>
                <div className='bg-card rounded-lg shadow-xl border-2 border-blush p-8 w-full max-w-md text-center'>
                    <BookOpen className='w-12 h-12 text-rose mx-auto mb-4' />
                    <h2 className='text-2xl font-serif text-burgundy mb-3'>Invalid Link</h2>
                    <p className='text-rose mb-6'>This password reset link is invalid.</p>
                    <button
                        onClick={onComplete}
                        className='w-full px-6 py-3 bg-rose-deep text-card rounded-lg hover:opacity-90 transition font-medium'
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className='min-h-screen bg-parchment flex items-center justify-center p-4'>
                <div className='bg-card rounded-lg shadow-xl border-2 border-blush p-8 w-full max-w-md text-center'>
                    <BookOpen className='w-12 h-12 text-rose mx-auto mb-4' />
                    <h2 className='text-2xl font-serif text-burgundy mb-3'>Password reset!</h2>
                    <p className='text-rose mb-6'>Your password has been updated. You can now log in with your new password.</p>
                    <button
                        onClick={onComplete}
                        className='w-full px-6 py-3 bg-rose-deep text-card rounded-lg hover:opacity-90 transition font-medium'
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-parchment flex items-center justify-center p-4'>
            <div className='bg-card rounded-lg shadow-xl border-2 border-blush p-8 w-full max-w-md'>
                <div className='text-center mb-8'>
                    <BookOpen className='w-12 h-12 text-rose mx-auto mb-3' />
                    <h1 className='text-3xl font-serif text-burgundy'>Reset Password</h1>
                    <p className='text-rose italic mt-1'>Create a new password</p>
                </div>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label className='block text-burgundy font-medium mb-2'>New Password</label>
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

                    <div>
                        <label className='block text-burgundy font-medium mb-2'>Confirm Password</label>
                        <div className='relative'>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className='w-full px-4 py-3 border-2 border-blush rounded-lg focus:border-rose focus:outline-none bg-card pr-12'
                                placeholder='Repeat your password'
                                required
                            />
                            <button
                                type='button'
                                onClick={() => setShowConfirm(!showConfirm)}
                                className='absolute right-3 top-1/2 -translate-y-1/2 text-rose hover:text-burgundy transition'
                            >
                                {showConfirm ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                            </button>
                        </div>
                    </div>

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
                        {loading ? 'Please wait...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
