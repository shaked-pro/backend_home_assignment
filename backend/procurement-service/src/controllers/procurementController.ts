import express from 'express';
import { getProcurements, addProcurement, fetchInventoryData } from '../services/procurementService';
import { ProcurementStatus } from '../models/ProcurementStatus';

const router = express.Router();

// GET /api/procurements
router.get('/', async (req, res) => {
    try {
        const procurements = await getProcurements();
        res.json(procurements);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
});

// POST /api/procurements
router.post('/', async (req, res)=> {
    try {
        const procurement = await addProcurement({
            ...req.body,
            status: ProcurementStatus.OPEN
        });
        res.status(201).json(procurement);
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error creating procurement:', error);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
});

router.get('/inventory', async (req, res) => {
    try {
        const inventoryData = await fetchInventoryData();
        res.json(inventoryData);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
})

export default router;