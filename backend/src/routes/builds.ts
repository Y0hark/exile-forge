import { Router, Request, Response } from 'express';
import { pool } from '../server';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Generate new build with OpenRouter AI
router.post('/generate', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { playstyle_description, class: playerClass, allow_uniques, allow_respec, preferred_ascendancy } = req.body;

        if (!playstyle_description) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Playstyle description is required'
            });
        }

        // Check for OpenRouter API key
        if (!process.env.OPENROUTER_API_KEY) {
            return res.status(503).json({
                error: 'Service Unavailable',
                message: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY in environment variables.',
            });
        }

        // Import OpenRouter service
        const { generateFullBuild } = await import('../services/openrouter');

        // Generate build with AI
        console.log('🎮 Generating build for user:', userId);
        const { build, explanation, cost } = await generateFullBuild({
            playstyle_description,
            class: playerClass,
            allow_uniques,
            allow_respec,
            preferred_ascendancy,
        });

        // Save build to database
        const result = await pool.query(
            `INSERT INTO builds 
             (user_id, name, class, ascendancy, main_skill, playstyle_description, build_data) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id, name, class, ascendancy, main_skill, created_at`,
            [
                userId,
                build.name,
                build.class,
                build.ascendancy,
                build.mainSkill.gem,
                playstyle_description,
                JSON.stringify({ ...build, explanation }),
            ]
        );

        const savedBuild = result.rows[0];

        console.log('✅ Build saved to database:', savedBuild.id);
        console.log(`💰 Generation cost: $${cost.costUSD.toFixed(4)}`);

        res.status(201).json({
            message: 'Build generated successfully',
            build: {
                id: savedBuild.id,
                name: savedBuild.name,
                class: savedBuild.class,
                ascendancy: savedBuild.ascendancy,
                mainSkill: savedBuild.main_skill,
                createdAt: savedBuild.created_at,
                data: build,
                explanation,
            },
            cost: {
                tokens: cost.tokens,
                usd: cost.costUSD,
            },
        });
    } catch (error) {
        console.error('Build generation error:', error);

        let errorMessage = 'Failed to generate build';
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        res.status(500).json({
            error: 'Internal Server Error',
            message: errorMessage,
        });
    }
});

// Get build by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const buildId = parseInt(req.params.id);

        const result = await pool.query(
            'SELECT * FROM builds WHERE id = $1',
            [buildId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Build not found'
            });
        }

        const row = result.rows[0];

        // Ensure build_data is an object
        let buildData = row.build_data;
        if (typeof buildData === 'string') {
            try {
                buildData = JSON.parse(buildData);
            } catch (e) {
                console.error('Failed to parse build_data:', e);
                buildData = {};
            }
        }

        res.json({
            build: {
                id: row.id,
                name: row.name,
                class: row.class,
                ascendancy: row.ascendancy,
                mainSkill: row.main_skill,
                playstyle_description: row.playstyle_description,
                data: buildData,
                explanation: buildData.explanation,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                isPublic: row.is_public,
                downloads: row.downloads
            }
        });
    } catch (error) {
        console.error('Get build error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve build'
        });
    }
});

// List user's builds
router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId);

        const result = await pool.query(
            'SELECT id, name, class, ascendancy, main_skill, created_at, updated_at, is_public, downloads FROM builds WHERE user_id = $1 ORDER BY updated_at DESC',
            [userId]
        );

        res.json({
            builds: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('List builds error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve builds'
        });
    }
});

// List public builds
router.get('/public', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;

        const result = await pool.query(
            'SELECT id, name, class, ascendancy, main_skill, created_at, downloads FROM builds WHERE is_public = true ORDER BY downloads DESC, created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        const countResult = await pool.query(
            'SELECT COUNT(*) FROM builds WHERE is_public = true'
        );

        res.json({
            builds: result.rows,
            total: parseInt(countResult.rows[0].count),
            page,
            limit
        });
    } catch (error) {
        console.error('List public builds error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve public builds'
        });
    }
});

// Update build
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const buildId = parseInt(req.params.id);
        const userId = req.user?.id;
        const { name, build_data } = req.body;

        // Check ownership
        const ownerCheck = await pool.query(
            'SELECT user_id FROM builds WHERE id = $1',
            [buildId]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Build not found'
            });
        }

        if (ownerCheck.rows[0].user_id !== userId) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not own this build'
            });
        }

        // Update build
        const result = await pool.query(
            'UPDATE builds SET name = COALESCE($1, name), build_data = COALESCE($2, build_data), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [name, build_data, buildId]
        );

        res.json({
            message: 'Build updated successfully',
            build: result.rows[0]
        });
    } catch (error) {
        console.error('Update build error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update build'
        });
    }
});

// Delete build
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const buildId = parseInt(req.params.id);
        const userId = req.user?.id;

        // Check ownership
        const ownerCheck = await pool.query(
            'SELECT user_id FROM builds WHERE id = $1',
            [buildId]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Build not found'
            });
        }

        if (ownerCheck.rows[0].user_id !== userId) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not own this build'
            });
        }

        // Delete build
        await pool.query('DELETE FROM builds WHERE id = $1', [buildId]);

        res.json({ message: 'Build deleted successfully' });
    } catch (error) {
        console.error('Delete build error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to delete build'
        });
    }
});

// Publish build
router.post('/:id/publish', async (req: AuthRequest, res: Response) => {
    try {
        const buildId = parseInt(req.params.id);
        const userId = req.user?.id;

        // Check ownership
        const ownerCheck = await pool.query(
            'SELECT user_id FROM builds WHERE id = $1',
            [buildId]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Build not found'
            });
        }

        if (ownerCheck.rows[0].user_id !== userId) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not own this build'
            });
        }

        // Publish build
        const result = await pool.query(
            'UPDATE builds SET is_public = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [buildId]
        );

        res.json({
            message: 'Build published successfully',
            build: result.rows[0]
        });
    } catch (error) {
        console.error('Publish build error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to publish build'
        });
    }
});

export default router;
