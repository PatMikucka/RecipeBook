import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import { request } from "../utils/api";

const ForgotPassword = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await request('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email })
            });
            setSubmitted(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className='min-h-screen bg-parchment flex items-center justify-center p-4'>
                <div className='bg-card rounded-lg shadow-xl border-2 border-blush p-8 w-full max-w-md text-center'>
                    <BookOpen className='w-12 h-12 text-rose mx-auto mb-4' />
                    <h2 className='text-2xl font-serif text-burgundy mb-3'>Check your email!</h2>
                    <p className='text-rose mb-6'>If an account exists for {email}, you'll receive a password reset link shortly.</p>
                    <button
                        onClick={onBack}
                        className='w-full px-6 py-3 bg-rose-deep text-card rounded-lg hover:opacity-90 transition font-medium'
                    >
                        Back to Login
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
                    <h1 className='text-3xl font-serif text-burgundy'>Forgot Password?</h1>
                    <p className='text-rose italic mt-1'>We'll send you a reset link</p>
                </div>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label className='block text-burgundy font-medium mb-2'>Email</label>
                        <input
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full px-4 py-3 border-2 border-blush rounded-lg focus:border-rose focus:outline-none bg-card'
                            placeholder='your@email.com'
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
                        className='w-full px-6 py-3 bg-rose-deep text-card rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {loading ? 'Please wait...' : 'Send Reset Link'}
                    </button>

                    <button
                        type='button'
                        onClick={onBack}
                        className='w-full px-6 py-3 bg-blush text-burgundy rounded-lg hover:opacity-80 transition font-medium'
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
