import { Router, Response } from 'express';
import { pool } from '../server';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get user preferences
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const result = await pool.query(
            'SELECT * FROM user_preferences WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            // Create default preferences if they don't exist
            const createResult = await pool.query(
                'INSERT INTO user_preferences (user_id) VALUES ($1) RETURNING *',
                [userId]
            );
            return res.json({ preferences: createResult.rows[0] });
        }

        res.json({ preferences: result.rows[0] });
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve preferences'
        });
    }
});

// Update user preferences
router.put('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { prefer_no_uniques, prefer_no_rare_uniques, allow_respec } = req.body;

        const result = await pool.query(
            `UPDATE user_preferences SET 
        prefer_no_uniques = COALESCE($1, prefer_no_uniques),
        prefer_no_rare_uniques = COALESCE($2, prefer_no_rare_uniques),
        allow_respec = COALESCE($3, allow_respec)
      WHERE user_id = $4 
      RETURNING *`,
            [prefer_no_uniques, prefer_no_rare_uniques, allow_respec, userId]
        );

        if (result.rows.length === 0) {
            // Create preferences if they don't exist
            const createResult = await pool.query(
                `INSERT INTO user_preferences (user_id, prefer_no_uniques, prefer_no_rare_uniques, allow_respec) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
                [userId, prefer_no_uniques, prefer_no_rare_uniques, allow_respec]
            );
            return res.json({
                message: 'Preferences created successfully',
                preferences: createResult.rows[0]
            });
        }

        res.json({
            message: 'Preferences updated successfully',
            preferences: result.rows[0]
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update preferences'
        });
    }
});

export default router;
