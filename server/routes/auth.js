import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

const router = express.Router();

router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.'});
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters.'});
        }

        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        )

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const verifyToken = crypto.randomBytes(32).toString('hex');

        const result = await pool.query(
            'INSERT INTO users (email, password, verify_token) VALUES ($1, $2, $3) RETURNING id, email, created_at',
            [email, hashedPassword, verifyToken]
        );

        const user = result.rows[0];

        const emailResponse = await resend.emails.send({
            from: 'My Recipe Book <onboarding@resend.dev>',
            to: email,
            subject: 'Please verify your email',
            html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2 style="color: #7a4a52;">Welcome to My Recipe Book!</h2>
                    <p style="color: #3d1a40;">Thanks for signing up. Please verify your email address to get started.</p>
                    <a href="https://recipebook-production-a132.up.railway.app/verify?token=${verifyToken}"
                       style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: #9e5a64; color: white; border-radius: 8px; text-decoration: none; font-weight: 500;">
                        Verify Email
                    </a>
                    <p style="color: #c47a84; font-size: 13px;">If you didn't create an account, you can safely ignore this email.</p>
                </div>
            `
        });

        res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const user = result.rows[0];

        if (!user.verified) {
            return res.status(401).json({ error: 'Please verify your email before logging in. Check your inbox.' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, user: { id: user.id, email: user.email } });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

router.get('/verify/:token', async (req, res) => {
    const { token } = req.params;

    try {
        if (!token) {
            return res.status(400).json({ error: 'Invalid verification token.' });
        }

        const result = await pool.query(
            'SELECT id, verified FROM users WHERE verify_token = $1',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired verification token.' });
        }

        if (result.rows[0].verified) {
            return res.json({ message: 'Email already verified.' });
        }

        await pool.query(
            'UPDATE users SET verified = true, verify_token = NULL WHERE id = $1',
            [result.rows[0].id]
        );

        res.json({ message: 'Email verified successfully.' });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ error: 'Email is required.' });
        }

        const result = await pool.query(
            'SELECT id, email FROM users WHERE email = $1 AND verified = true',
            [email]
        );

        if (result.rows.length === 0) {
            return res.json({ message: 'You will receive a reset link soon.' });         
        }

        const user = result.rows[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        await pool.query(
            'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
            [resetToken, resetExpiry, user.id]
        );

        await resend.emails.send({
            from: 'My Recipe Book <onboarding@resend.dev>',
            to: email,
            subject: 'Reset your password.',
            html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2 style="color: #7a4a52;">Reset your password</h2>
                    <p style="color: #3d1a40;">We received a request to reset your password. Click the button below to choose a new one.</p>
                    <a href="https://recipebook-production-a132.up.railway.app/reset-password?token=${resetToken}"
                       style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: #9e5a64; color: white; border-radius: 8px; text-decoration: none; font-weight: 500;">
                        Reset Password
                    </a>
                    <p style="color: #c47a84; font-size: 13px;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
                </div>
            `
        });

        res.json({ message: 'You will receive a reset link soon.' });

    } catch (error) {
        console.error('forgot password error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        if (!token || !password) {
            return res.status(400).json({ error: 'Token and password are required.' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters.' });
        }

        const result = await pool.query(
            'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired reset link' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.query(
            'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
            [hashedPassword, result.rows[0].id]
        );

        res.json({ message: 'Password reset successfully. You can now log in.' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

export default router;