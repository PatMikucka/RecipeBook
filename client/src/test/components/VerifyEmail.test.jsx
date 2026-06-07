import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VerifyEmail from '../../components/VerifyEmail';
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

const renderVerifyEmail = (overrides = {}) => {
    const user = userEvent.setup();
    const props = {
        onContinue: vi.fn(),
        ...overrides
    };

    render(<VerifyEmail {...props} />);
    return { ...props, user };
};

describe('no token in URL', () => {
    beforeEach(() => setToken(null));

    it('should show the error screen', async () => {
        renderVerifyEmail();

        expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should show the invalid link message', async () => {
        renderVerifyEmail();

        expect(await screen.findByText(/invalid or has already been used/i)).toBeInTheDocument();
    });

    it('should not call the API when there is no token', () => {
        renderVerifyEmail();

        expect(request).not.toHaveBeenCalled();
    });

    it('should call onContinue when Back and Login are clicked', async () => {
        const { onContinue, user } = renderVerifyEmail();

        await user.click(await screen.findByRole('button', { name: /back to login/i }));

        expect(onContinue).toHaveBeenCalledTimes(1);
    });
});

describe('loading state', () => {
    beforeEach(() => setToken('valid-token-123'));

    it('should show verifying message while loading', () => {
        request.mockImplementation(() => new Promise(() => {}));
        renderVerifyEmail();

        expect(screen.getByText(/verifying your email/i)).toBeInTheDocument();
    });

    it('should call request with the correct endpoint', () => {
        request.mockImplementation(() => new Promise(() => {}));
        renderVerifyEmail();

        expect(request).toHaveBeenCalledWith('/auth/verify/valid-token-123');
    });
});

describe('success status', () => {
    beforeEach(() => setToken('valid-token-123'));

    it('should show the success screen after successful verification', async () => {
        request.mockResolvedValue({ message: 'Email verified successfully.' });
        renderVerifyEmail();

        expect(await screen.findByText(/email verified/i)).toBeInTheDocument();
    });

    it('should not show loading or error screen on success', async () => {
        request.mockResolvedValue({ message: 'Email verified successfully.' });
        renderVerifyEmail();

        await screen.findByText(/email verified/i);

        expect(screen.queryByText(/verifying your email/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });

    it('should call onContinue when Go to Login is clicked', async () => {
        const { onContinue, user } = renderVerifyEmail();

        request.mockResolvedValue({ message: 'Email verified successfully.' });

        await user.click(await screen.findByRole('button', { name: /go to login/i }));

        expect(onContinue).toHaveBeenCalledTimes(1);
    });
});

describe('error state', () => {
    beforeEach(() => setToken('expired-token-456'));

    it('should show the error screen when the API call fails', async () => {
        request.mockRejectedValue(new Error('Invalid or expired verification token.'));
        renderVerifyEmail();

        expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should show the invalid link message on API failure', async () => {
        request.mockRejectedValue(new Error('Invalid or expired verification token.'));
        renderVerifyEmail();

        expect(await screen.findByText(/invalid or has already been used/i)).toBeInTheDocument();
    });

    it('should not show the success screen on API failure', async () => {
        request.mockRejectedValue(new Error('Invalid or expired verification token.'));
        renderVerifyEmail();

        await screen.findByText(/something went wrong/i);

        expect(screen.queryByText(/email verified/i)).not.toBeInTheDocument();
    });

    it('should call onContinue when Back to Login is clicked on the error screen', async () => {
        const { onContinue, user } = renderVerifyEmail();

        request.mockRejectedValue(new Error('Invalid or expired verification token.'));

        await user.click(await screen.findByRole('button', { name: /back to login/i }));

        expect(onContinue).toHaveBeenCalledTimes(1);
    });
});