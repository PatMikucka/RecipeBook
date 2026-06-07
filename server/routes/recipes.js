import express from 'express';
import pool from '../db/index.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM recipes WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

router.post('/', async (req, res) => {
    const { title, time, servings, mood, ingredients, instructions } = req.body;

    try {
        if (!title || !time || !servings || !ingredients || !instructions) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const result = await pool.query(
            `INSERT INTO recipes (user_id, title, time, servings, mood, ingredients, instructions)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [req.user.id, title, time, servings, mood, ingredients, instructions]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error saving recipe:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

router.put('/:id', async (req, res) => {
    const { title, time, servings, mood, ingredients, instructions } = req.body;
    const { id } = req.params;

    try {
        const existing = await pool.query(
            'SELECT id FROM recipes WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Recipe not found.' });
        }
        const result = await pool.query(
            `UPDATE recipes
            SET title = $1, time = $2, servings = $3, mood = $4,
                ingredients = $5, instructions = $6
            WHERE id = $7 AND user_id = $8
            RETURNING *`,
            [title, time, servings, mood, ingredients, instructions, id, req.user.id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating recipe:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM recipes WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Recipe not found.' });
        }

        res.json({ message: 'Recipe deleted successfully.' });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

export default router;
