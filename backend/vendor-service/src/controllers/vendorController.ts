import express from 'express';
// import { getVendors, addVendor } from '../services/vendorService';
import { checkVendorData } from '../models/vendor';
import { getVendors, addVendor, getVendorPercurmentsById } from '../services/vendorService';
import { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

// Get all vendors
router.get('/', async (req, res) => {
    try {
        const vendors = await getVendors();
        res.json(vendors);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
    
});

// Add a new vendor
router.post('/', async (req, res) => {
    try {
        const validationError = checkVendorData(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }
        const newVendor = await addVendor(req.body);
        res.status(201).json(newVendor);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
    
});

router.get('/:id/procurments/create', async (req: Request, res:Response) => {
    try {
        const vendorId = req.params.id; // Get vendor ID from URL parameter
        let vendor = getVendorPercurmentsById(vendorId);
        res.json(vendor);
    }catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
});

router.get('/:id/procurments/view', async (req: Request, res: Response) => {
    try {
        const vendorId = req.params.id; // Get vendor ID from URL parameter
        const procurments = await axios.get(`http://host.docker.internal:3002/api/procurements/filter-by-vendorId/${vendorId}`);
        return res.json(procurments.data);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
});
    

export default router;
