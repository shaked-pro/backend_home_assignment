import express from 'express';
import { getProcurements, addProcurement, fetchInventoryData, getFilteredQuantityProcurements, getFilteredStatusProcurements, getFilteredProcurementsByVendor } from '../services/procurementService';
import { ProcurementStatus } from '../models/ProcurementStatus';
import { min } from 'date-fns';

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

// POST /api/procurements
router.get('/inventoryLevels', async (req, res) => { //task number 2
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

 //Get   /api/ procurements
router.get('/filter-by-quantity', async (req, res) => {
    try {
        const minQuantity = parseInt(req.query.minQuantity as string, 10); 
        const procurments = await getFilteredQuantityProcurements(minQuantity);
        return res.json(procurments);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
}); //task 4

//Get   /api/procurements
router.get('/filter-by-status', async (req, res) => {
    try {
        const status = (req.query.status);
        if (typeof status !== 'string') {
            return res.status(400).json({ error: 'Invalid or missing status query parameter' });
        }
        const procurments = await getFilteredStatusProcurements(status);
        return res.json(procurments);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
}); //task 4

//Get   /api/procurements
router.get('/filter-by-vendorId/:id', async (req, res) => {
    try {
        const vendorId = parseInt(req.params.id, 10);
        const procurments = await getFilteredProcurementsByVendor(vendorId);
        return res.json(procurments);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
}); 


export default router;