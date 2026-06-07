import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthForm from '../../components/AuthForm';
import { request } from '../../utils/api';

vi.mock('../../utils/api.js', () => ({
    request: vi.fn()
}));

vi.mock('../../components/ForgotPassword.jsx', () => ({
    default: ({ onBack }) => (
        <div>
            <span>ForgotPassword component</span>
            <button onClick={onBack}>Back</button>
        </div>
    )
}));

let store = {};

const localStorageMock = {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; })
};

vi.stubGlobal('localStorage', localStorageMock);

beforeEach(() => {
    vi.clearAllMocks();
    store = {};
});

const renderAuthForm = (overrides = {}) => {
    const user = userEvent.setup();
    const props = {
        onLogin: vi.fn(),
        ...overrides
    };
    render(<AuthForm {...props} />);
    return { ...props, user };
};

describe('rendering', () => {
    it('should render the Login and Register toggle buttons', () => {  // fixed: was 'reender'
        renderAuthForm();

        expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^register$/i })).toBeInTheDocument();
    });

    it('should show the email and password fields', () => {
        renderAuthForm();

        expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/minimum 8 characters/i)).toBeInTheDocument();
    });

    it('should show Forgot Password link in login mode', () => {
        renderAuthForm();

        expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument();
    });

    it('should not show Forgot Password link in the register mode', async () => {
        const { user } = renderAuthForm();

        await user.click(screen.getByRole('button', { name: /^register$/i }));

        expect(screen.queryByRole('button', { name: /forgot password/i })).not.toBeInTheDocument();
    });

    it('should show a submit button labelled Login in login mode', () => {
        renderAuthForm();

        expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    });

    it('should show a submit button labelled Create Account in the register mode', async () => {
        const { user } = renderAuthForm();

        await user.click(screen.getByRole('button', { name: /^register$/i }));

        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });
});

describe('password visibility toggle', () => {
    it('should start with password hidden', () => {
        renderAuthForm();

        expect(screen.getByPlaceholderText(/minimum 8 characters/i)).toHaveAttribute('type', 'password');
    });

    it('should show password when the eye button is clicked', async () => {
        const { user } = renderAuthForm();

        const passwordField = screen.getByPlaceholderText(/minimum 8 characters/i);
        const toggleButton = passwordField.parentElement.querySelector('button');

        await user.click(toggleButton);

        expect(passwordField).toHaveAttribute('type', 'text');
    });

    it('should hide password again when the eye button is clicked 2nd time', async () => {
        const { user } = renderAuthForm();

        const passwordField = screen.getByPlaceholderText(/minimum 8 characters/i);
        const toggleButton = passwordField.parentElement.querySelector('button');

        await user.click(toggleButton);
        await user.click(toggleButton);

        expect(passwordField).toHaveAttribute('type', 'password');
    });
});

describe('login/register toggle', () => {
    it('should switch to register mode when Register is clicked', async () => {
        const { user } = renderAuthForm();

        await user.click(screen.getByRole('button', { name: /^register$/i }));

        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should switch back to login mode when Login is clicked', async () => {
        const { user } = renderAuthForm();

        await user.click(screen.getByRole('button', { name: /^register$/i }));
        await user.click(screen.getByRole('button', { name: /^login$/i }));

        expect(screen.queryByRole('button', { name: /create account/i })).not.toBeInTheDocument();
    });

    it('should clear the error message when switching modes', async () => {
        const { user } = renderAuthForm();

        request.mockRejectedValue(new Error('Invalid email or password.'));

        await user.type(screen.getByPlaceholderText(/your@email.com/i), 'a@b.com');
        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'wrongpassword');
        await user.click(screen.getByRole('button', { name: /^sign in$/i }));

        expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /^register$/i }));

        expect(screen.queryByText('Invalid email or password.')).not.toBeInTheDocument();
    });
});

describe('login flow', () => {
    it('should call request with the correct endpoint and credentials', async () => {
        const { user } = renderAuthForm();

        request.mockResolvedValue({ token: 'tok123', user: { id: '1', email: 'a@b.com' } });

        await user.type(screen.getByPlaceholderText(/your@email.com/i), 'a@b.com');
        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'password123');

        await user.click(screen.getByRole('button', { name: /^sign in$/i }));

        expect(request).toHaveBeenCalledWith('/auth/login', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'a@b.com', password: 'password123' })
        }));
    });

    it('should store the token in localStorage on successful login', async () => {
        const { user } = renderAuthForm();

        request.mockResolvedValue({ token: 'tok123', user: { id: '1', email: 'a@b.com' } });

        await user.type(screen.getByPlaceholderText(/your@email.com/i), 'a@b.com');
        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'password123');
        await user.click(screen.getByRole('button', { name: /^sign in$/i }));

        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'tok123');
    });

    it('should call onLogin with user data on successful login', async () => {
        const { user, onLogin } = renderAuthForm();
        const mockUser = { id: '1', email: 'a@b.com' };

        request.mockResolvedValue({ token: 'tok123', user: mockUser });

        await user.type(screen.getByPlaceholderText(/your@email.com/i), 'a@b.com');
        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'password123');
        await user.click(screen.getByRole('button', { name: /^sign in$/i }));

        expect(onLogin).toHaveBeenCalledWith(mockUser);
    });

    it('should display an error message on failed login', async () => {
        const { user } = renderAuthForm();

        request.mockRejectedValue(new Error('Invalid email or password.'));

        await user.type(screen.getByPlaceholderText(/your@email.com/i), 'a@b.com');
        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'wrongpassword');
        await user.click(screen.getByRole('button', { name: /^sign in$/i }));

        expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
    });

    it('should not call onLogin on failed login', async () => {
        const { user, onLogin } = renderAuthForm();

        request.mockRejectedValue(new Error('Invalid email or password.'));

        await user.type(screen.getByPlaceholderText(/your@email.com/i), 'a@b.com');
        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'wrongpassword');

        await user.click(screen.getByRole('button', { name: /^sign in$/i }));
        await screen.findByText('Invalid email or password.');

        expect(onLogin).not.toHaveBeenCalled();
    });

    it('should disable the submit button while the request is in flight', async () => {
        const { user } = renderAuthForm();

        request.mockImplementation(() => new Promise(() => {}));

        await user.type(screen.getByPlaceholderText(/your@email.com/i), 'a@b.com');
        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'password123');
        await user.click(screen.getByRole('button', { name: /^sign in$/i }));

        expect(screen.getByRole('button', { name: /please wait/i })).toBeDisabled();
    });
});

describe('register flow', () => {
    it('should call request with the correct endpoint and credentials', async () => {
        const { user } = renderAuthForm();

        request.mockResolvedValue({ message: 'Registration successful.' });

        await user.click(screen.getByRole('button', { name: /^register$/i }));
        await user.type(screen.getByPlaceholderText(/your@email.com/i), 'new@user.com');

        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'password123');
        await user.click(screen.getByRole('button', { name: /create account/i }));

        expect(request).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'new@user.com', password: 'password123' })
        }));
    });

    it('should show the check your email screen on successful registration', async () => {
        const { user } = renderAuthForm();

        request.mockResolvedValue({ message: 'Registration successful.' });

        await user.click(screen.getByRole('button', { name: /^register$/i }));
        await user.type(screen.getByPlaceholderText(/your@email.com/i), 'new@user.com');

        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'password123');
        await user.click(screen.getByRole('button', { name: /create account/i }));

        expect(await screen.findByText(/check your email/i)).toBeInTheDocument();
        expect(screen.getByText('new@user.com')).toBeInTheDocument();
    });

    it('should not call onLogin after successful registration', async () => {
        const { user, onLogin } = renderAuthForm();

        request.mockResolvedValue({ message: 'Registration successful.' });

        await user.click(screen.getByRole('button', { name: /^register$/i }));
        await user.type(screen.getByPlaceholderText(/your@email.com/i), 'new@user.com');

        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'password123');
        await user.click(screen.getByRole('button', { name: /create account/i }));

        await screen.findByText(/check your email/i);

        expect(onLogin).not.toHaveBeenCalled();
    });

    it('should display an error message on failed registration', async () => {
        const { user } = renderAuthForm();

        request.mockRejectedValue(new Error('An account with this email already exists.'));

        await user.click(screen.getByRole('button', { name: /^register$/i }));
        await user.type(screen.getByPlaceholderText(/your@email.com/i), 'existing@user.com');

        await user.type(screen.getByPlaceholderText(/minimum 8 characters/i), 'password123');
        await user.click(screen.getByRole('button', { name: /create account/i }));

        expect(await screen.findByText('An account with this email already exists.')).toBeInTheDocument();
    });
});

describe('forgot password', () => {
    it('should render the ForgotPassword component when Forgot password is clicked', async () => {
        const { user } = renderAuthForm();

        await user.click(screen.getByRole('button', { name: /forgot password/i }));

        expect(screen.getByText('ForgotPassword component')).toBeInTheDocument();
    });

    it('should return to the login form when Back is clicked in ForgotPassword', async () => {
        const { user } = renderAuthForm();

        await user.click(screen.getByRole('button', { name: /forgot password/i }));
        await user.click(screen.getByRole('button', { name: /back/i }));

        expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
    });
});