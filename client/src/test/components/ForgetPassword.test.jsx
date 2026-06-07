import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPassword from '../../components/ForgotPassword';
import { request } from '../../utils/api';

vi.mock('../../utils/api.js', () => ({
    request: vi.fn()
}));

beforeEach(() => {
    vi.clearAllMocks();
});

const renderForgotPassword = (overrides = {}) => {
    const user = userEvent.setup();
    const props = {
        onBack: vi.fn(),
        ...overrides
    };
    render(<ForgotPassword {...props} />);
    return { ...props, user };
};

describe('rendering', () => {
    it('should show the email input', () => {
        renderForgotPassword();

        expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
    });

    it('should show the Send Reset Link button', () => {
        renderForgotPassword();

        expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });

    it('should show the Back to Login button', () => {
        renderForgotPassword();

        expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument();
    });

    it('should not show the confirmation screen initially', () => {
        renderForgotPassword();

        expect(screen.queryByText(/check your email/i)).not.toBeInTheDocument();
    });
});

describe('submission', () => {
    it('should call request with the correct endpoint and email', async () => {
        const { user } = renderForgotPassword();

        request.mockResolvedValue({ message: 'You will receive a reset link soon.' });

        await user.type(screen.getByPlaceholderText(/your@email.com/i), 'a@b.com');
        await user.click(screen.getByRole('button', { name: /send reset link/i }));

        expect(request).toHaveBeenCalledWith('/auth/forgot-password', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'a@b.com' })
        }));
    });

    it('should show the confirmation screen with the email on success', async () => {
        const { user } = renderForgotPassword();

        request.mockResolvedValue({ message: 'You will receive a reset link soon.' });

        await user.type(screen.getByPlaceholderText(/your@email.com/i), 'a@b.com');
        await user.click(screen.getByRole('button', { name: /send reset link/i }));

        expect(await screen.findByText(/check your email/i)).toBeInTheDocument();

        expect(screen.getByText((_, element) =>
            element?.tagName === 'P' &&
            element?.textContent?.includes('a@b.com')
        )).toBeInTheDocument();
    });

    it('should not show the form after successful submission', async () => {
        const { user } = renderForgotPassword();

        request.mockResolvedValue({ message: 'You will receive a reset link soon.' });

        await user.type(screen.getByPlaceholderText(/your@email.com/i), 'a@b.com');
        await user.click(screen.getByRole('button', { name: /send reset link/i }));
        await screen.findByText(/check your email/i);

        expect(screen.queryByRole('button', { name: /send reset link/i })).not.toBeInTheDocument();
    });

    it('should show an error message on failure', async () => {
        const { user } = renderForgotPassword();

        request.mockRejectedValue(new Error('Server error. Please try again.'));

        await user.type(screen.getByPlaceholderText(/your@email.com/i), 'a@b.com');
        await user.click(screen.getByRole('button', { name: /send reset link/i }));

        expect(await screen.findByText('Server error. Please try again.')).toBeInTheDocument();
    });

    it('should keep the form visible after a failed submission', async () => {
        const { user } = renderForgotPassword();

        request.mockRejectedValue(new Error('Server error. Please try again.'));

        await user.type(screen.getByPlaceholderText(/your@email.com/i), 'a@b.com');
        await user.click(screen.getByRole('button', { name: /send reset link/i }));
        await screen.findByText('Server error. Please try again.');

        expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });
});

describe('loading state', () => {
    it('should disable the submit button and show Please wait while loading', async () => {
        const { user } = renderForgotPassword();

        request.mockImplementation(() => new Promise(() => {}));

        await user.type(screen.getByPlaceholderText(/your@email.com/i), 'a@b.com');
        await user.click(screen.getByRole('button', { name: /send reset link/i }));

        expect(screen.getByRole('button', { name: /please wait/i })).toBeDisabled();
    });
});

describe('back button', () => {
    it('should call onBack when Back to Login is clicked on the form', async () => {
        const { onBack, user } = renderForgotPassword();

        await user.click(screen.getByRole('button', { name: /back to login/i }));

        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('should call onBack when Back to Login is clicked on the confirmation screen', async () => {
        const { onBack, user } = renderForgotPassword();

        request.mockResolvedValue({ message: 'You will receive a reset link soon.' });

        await user.type(screen.getByPlaceholderText(/your@email.com/i), 'a@b.com');
        await user.click(screen.getByRole('button', { name: /send reset link/i }));

        await screen.findByText(/check your email/i);
        await user.click(screen.getByRole('button', { name: /back to login/i }));

        expect(onBack).toHaveBeenCalledTimes(1);
    });
});