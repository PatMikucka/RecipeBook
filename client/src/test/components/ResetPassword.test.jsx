import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPassword from '../../components/ResetPassword';
import { request } from "../../utils/api";

vi.mock('../../utils/api.js', () => ({
    request: vi.fn()
}));

beforeEach(() => {
    vi.clearAllMocks();
});

const setToken = (token) => {
    Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...window.location, search: token ? `?token=${token}` : '' }
    });
};

const renderResetPassword = (overrides = {}) => {
    const user = userEvent.setup();
    const props = {
        onComplete: vi.fn(),
        ...overrides
    };
    render(<ResetPassword {...props} />);
    return { ...props, user };
};

describe('no token in URL', () => {
    beforeEach(() => setToken(null));

    it('should show the Invalid link screen', () => {
        renderResetPassword();

        expect(screen.queryByText(/invalid link/i)).toBeInTheDocument();
    });

    it('should not show the password form', () => {
        renderResetPassword();

        expect(screen.queryByPlaceholderText(/minimum 8 characters/i)).not.toBeInTheDocument();
    });

    it('should call onComplete when Back to Login is clicked', async () => {
        const { onComplete, user } = renderResetPassword();

        await user.click(screen.getByRole('button', { name: /back to login/i }));

        expect(onComplete).toHaveBeenCalledTimes(1);
    });
});


describe('form view', () => {
    beforeEach(() => setToken('valid-token-123'));

    it('should show 2 password fields', () => {
        renderResetPassword();

        const passwordFields = screen.getAllByPlaceholderText(/minimum 8 characters|repeat your password/i);

        expect(passwordFields).toHaveLength(2);
    });

    it('should show the Reset Password submit button', () => {
        renderResetPassword();

        expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    it('should start with both password fields hidden', () => {
        renderResetPassword();

        const passwordFields = screen.getAllByDisplayValue('');

        passwordFields.forEach(field => {
            if (field.type === 'password' || field.type === 'text') {
                expect(field).toHaveAttribute('type', 'password');
            }
        });
    });
});

describe('password visibility toggles', () => {
    beforeEach(() => setToken('valid-token-123'));

    it('should toggle the new password field visibility', async () => {
        const { user } = renderResetPassword();

        const newPasswordField = screen.getByPlaceholderText(/minimum 8 characters/i);
        const toggleButton = newPasswordField.parentElement.querySelector('button');

        await user.click(toggleButton);

        expect(newPasswordField).toHaveAttribute('type', 'text');
    });

    it('should toggle the confirm password field visibility', async () => {
        const { user } = renderResetPassword();

        const confirmField = screen.getByPlaceholderText(/repeat your password/i);
        const toggleButton = confirmField.parentElement.querySelector('button');

        await user.click(toggleButton);

        expect(confirmField).toHaveAttribute('type', 'text');

        await user.click(toggleButton);

        expect(confirmField).toHaveAttribute('type', 'password');
    });
});

describe('password validation', () => {
    beforeEach(() => setToken('valid-token-123'));

    it('should show an error and not call the API when passwords do not match', async () => {
        const { user } = renderResetPassword();

        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'password123');
        await user.type(screen.getByPlaceholderText(/repeat your password/i), 'differentpassword');
        await user.click(screen.getByRole('button', { name: /reset password/i }));

        expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
        expect(request).not.toHaveBeenCalled();
    });

    it('should not show an error when passwords match', async () => {
        const { user } = renderResetPassword();

        request.mockResolvedValue({ message: 'Password reset successfully.' });

        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'password123');
        await user.type(screen.getByPlaceholderText(/repeat your password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /reset password/i }));

        expect(screen.queryByText(/passwords don't match/i)).not.toBeInTheDocument();
    });
});

describe('submission', () => {
    beforeEach(() => setToken('valid-token-123'));

    it('should call request with the correct endpoint and password', async () => {
        const { user } = renderResetPassword();

        request.mockResolvedValue({ message: 'Password reset successfully.' });

        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'newpassword123');
        await user.type(screen.getByPlaceholderText(/repeat your password/i), 'newpassword123');
        await user.click(screen.getByRole('button', { name: /reset password/i }));
 
        expect(request).toHaveBeenCalledWith('/auth/reset-password/valid-token-123', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ password: 'newpassword123' })
        }));
    });
 
    it('should show the success screen on successful reset', async () => {
        const { user } = renderResetPassword();

        request.mockResolvedValue({ message: 'Password reset successfully.' });
 
        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'newpassword123');
        await user.type(screen.getByPlaceholderText(/repeat your password/i), 'newpassword123');
        await user.click(screen.getByRole('button', { name: /reset password/i }));
 
        expect(await screen.findByText(/password reset!/i)).toBeInTheDocument();
    });
 
    it('should not show the form after successful reset', async () => {
        const { user } = renderResetPassword();

        request.mockResolvedValue({ message: 'Password reset successfully.' });
 
        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'newpassword123');
        await user.type(screen.getByPlaceholderText(/repeat your password/i), 'newpassword123');
        await user.click(screen.getByRole('button', { name: /reset password/i }));
 
        await screen.findByText(/password reset!/i);

        expect(screen.queryByRole('button', { name: /reset password/i })).not.toBeInTheDocument();
    });
 
    it('should show an error message on failed reset', async () => {
        const { user } = renderResetPassword();

        request.mockRejectedValue(new Error('Invalid or expired reset link'));
 
        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'newpassword123');
        await user.type(screen.getByPlaceholderText(/repeat your password/i), 'newpassword123');
        await user.click(screen.getByRole('button', { name: /reset password/i }));
 
        expect(await screen.findByText('Invalid or expired reset link')).toBeInTheDocument();
    });
 
    it('should keep the form visible after a failed reset', async () => {
        const { user } = renderResetPassword();

        request.mockRejectedValue(new Error('Invalid or expired reset link'));
 
        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'newpassword123');
        await user.type(screen.getByPlaceholderText(/repeat your password/i), 'newpassword123');
        await user.click(screen.getByRole('button', { name: /reset password/i }));
 
        await screen.findByText('Invalid or expired reset link');

        expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
});

describe('loading state', () => {
    beforeEach(() => setToken('valid-token-123'));
 
    it('should disable the submit button and show Please wait while loading', async () => {
        const { user } = renderResetPassword();

        request.mockImplementation(() => new Promise(() => {}));
 
        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'newpassword123');
        await user.type(screen.getByPlaceholderText(/repeat your password/i), 'newpassword123');
        await user.click(screen.getByRole('button', { name: /reset password/i }));
 
        expect(screen.getByRole('button', { name: /please wait/i })).toBeDisabled();
    });
});

describe('success screen', () => {
    beforeEach(() => setToken('valid-token-123'));
 
    it('should call onComplete when Go to Login is clicked on the success screen', async () => {
        const { onComplete, user } = renderResetPassword();

        request.mockResolvedValue({ message: 'Password reset successfully.' });
 
        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'newpassword123');
        await user.type(screen.getByPlaceholderText(/repeat your password/i), 'newpassword123');
        await user.click(screen.getByRole('button', { name: /reset password/i }));
 
        await screen.findByText(/password reset!/i);
        await user.click(screen.getByRole('button', { name: /go to login/i }));
 
        expect(onComplete).toHaveBeenCalledTimes(1);
    });
});