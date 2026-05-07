import React, { useEffect, useState } from 'react';
import { BookOpen, Check } from 'lucide-react';
import { request } from '../utils/api.js';

const VerifyEmail = ({ onContinue }) => {
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
            setStatus('error');
            return;
        }

        request(`/auth/verify/${token}`)
            .then(() => setStatus('success'))
            .catch(() => setStatus('error'));
    }, []);

    if (status === 'loading') {
        return (
            <div className='min-h-screen bg-parchment flex items-center justify-center p-4'>
                <div className='bg-card rounded-lg shadow-xl border-2 border-blush p-8 w-full max-w-md text-center'>
                    <BookOpen className='w-12 h-12 text-rose mx-auto mb-4 animate-pulse' />
                    <h2 className='text-2xl font-serif text-burgundy'>Verifying your email...</h2>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className='min-h-screen bg-parchment flex items-center justify-center p-4'>
                <div className='bg-card rounded-lg shadow-xl border-2 border-blush p-8 w-full max-w-md text-center'>
                    <BookOpen className='w-12 h-12 text-rose mx-auto mb-4' />
                    <h2 className='text-2xl font-serif text-burgundy mb-3'>Something went wrong</h2>
                    <p className='text-rose mb-6'>This verification link is invalid or has already been used.</p>
                    <button
                        onClick={onContinue}
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
            <div className='bg-card rounded-lg shadow-xl border-2 border-blush p-8 w-full max-w-md text-center'>
                <div className='w-16 h-16 bg-rose-deep rounded-full flex items-center justify-center mx-auto mb-4'>
                    <Check className='w-8 h-8 text-card' />
                </div>
                <h2 className='text-2xl font-serif text-burgundy mb-3'>Email verified!</h2>
                <p className='text-rose mb-6'>Your account is now active. You can log in and start adding recipes.</p>
                <button
                    onClick={onContinue}
                    className='w-full px-6 py-3 bg-rose-deep text-card rounded-lg hover:opacity-90 transition font-medium'
                >
                    Go to Login
                </button>
            </div>
        </div>
    );
};

export default VerifyEmail;