import React, { useState } from 'react';
import { MessageSquare, Send, Check } from 'lucide-react';

const FeedbackForm = () => {
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await fetch('https://formspree.io/f/mkoarzjy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, message })
            });

            if (response.ok) {
                setStatus('success');
                setMessage('');
                setEmail('');
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    return (
        <footer className='mt-16 border-t-2 border-blush'>
            <div className='max-w-xl mx-auto px-4 py-12 text-center'>
                <div className='flex items-center justify-center gap-2 mb-2'>
                    <MessageSquare className='w-5 h-5 text-rose' />
                    <h2 className='text-xl font-serif text-burgundy'>Share Your Thoughts</h2>
                </div>

                <p className='text-rose text-sm italic mb-6'>
                    Got an idea or spotted something off? I'd love to hear them from you 😊
                </p>

                {status === 'success' ? (
                    <div className='flex flex-col items-center gap-3 py-6'>
                        <div className='w-12 h-12 bg-rose-deep rounded-full flex items-center justify-center'>
                            <Check className='w-6 h-6 text-card' />
                        </div>
                        <p className='text-burgundy font-medium'>Thanks for your feedback! 💜</p>
                        <p className='text-rose text-sm'>I'll read every message.</p>
                        <button
                            onClick={() => setStatus('idle')}
                            className='mt-2 text-sm text-rose underline hover:text-burgundy transition'>
                                Send another
                            </button>
                        </div>
                ) : (
                    <form onSubmit={handleSubmit} className='space-y-3 text-left'>
                        <div>
                            <label htmlFor='feedback-email' className='block text-burgundy text-sm font-medium mb-1'>
                                Your email <span className='text-rose font-normal'>(optional)</span>
                            </label>
                            <input
                                id='feedback-email'
                                type='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder='your@email.com'
                                className='w-full px-4 py-2 border-2 border-blush rounded-lg focus:border-rose focus:outline-none bg-card text-burgundy text-sm' />
                        </div>

                        <div>
                            <label htmlFor='feedback-message' className='block text-burgundy text-sm font-medium mb-1'>
                                Message <span className='text-rose'>*</span>
                            </label>
                            <textarea
                                id='feedback-message'
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder='Ideas, bugs, anything...'
                                required
                                rows={4}
                                className='w-full px-4 py-2 border-2 border-blush rounded-lg focus:border-rose focus:outline-none bg-card text-burgundy text-sm resize-none'
                                />
                        </div>

                        {status === 'error' && (
                            <p className='text-red-600 text-sm'>
                                Something went wrong - please try again or email me directly.
                            </p>
                        )}

                        <button
                            type='submit'
                            disabled={status === 'loading'}
                            className='w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-deep text-card rounded-lg hover:opacity-90 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed'>
                                {status === 'loading' ? (
                                    'Sending...'
                                ) : (
                                    <>
                                    <Send className='w-4 h-4' />
                                    Send Feedback
                                    </>
                                )}
                            </button>
                    </form>
                )}
                <p className='text-rose text-sm mt-8 opacity-60'>
                    My RecipeBook · v1
                </p>
            </div>
        </footer>
    );
};

export default FeedbackForm;