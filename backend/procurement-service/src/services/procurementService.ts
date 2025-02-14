import { Pool } from 'pg';
import { Procurement } from '../models/procurement';
import { ProcurementStatus } from '../models/ProcurementStatus';
import axios from 'axios';
import { min, parseISO } from 'date-fns';

const mockInventory = "https://6780ed5385151f714b0887a4.mockapi.io/api/v1/inventory"; // inventory data task number 2

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'procurement_db',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432'),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const getProcurements = async (): Promise<Procurement[]> => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM procurements');
        console.log('result:', result.rows);
        return result.rows.map(row => ({
            ...row,
            createdAt: row.createdat}));
    } finally {
        client.release();
    }
};

export const addProcurement = async (procurement: Partial<Procurement>): Promise<Procurement> => {
    const client = await pool.connect();
    try {
        const { title, description, items, status, vendor_id } = procurement;
        const result = await client.query(
            'INSERT INTO procurements (title, description, items, status,  createdAt ,vendor_id) VALUES ($1, $2, $3, $4, $5 , $6) RETURNING *',
            [title, description, JSON.stringify(items), status || ProcurementStatus.OPEN, new Date() , vendor_id]
        );
        return result.rows[0];

    } finally {
        client.release();
    }
};

export const cleanup = async () => {
    await pool.end();
};

export const fetchInventoryData = async () => {
    try {
        console.log ("fetching inventory data from: ", mockInventory);
        const response = await axios.get(mockInventory);
        console.log('response:', response.data);
        return response.data; // Return structured data from the external API
    } catch (error) {
        console.error('Error fetching external data:', error);
        throw new Error('Failed to fetch data from external API');
    }
};

export const getFilteredQuantityProcurements= async(minQuantity: number): Promise<Procurement[]> => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT DISTINCT ON (p.id) p.*
            FROM procurements p,
            jsonb_array_elements(p.items::jsonb) AS item
            WHERE (item->>'quantity')::int >= $1`,
            [minQuantity] // Pass minQuantity as a parameter
        );
        return result.rows.map(row => ({
            ...row,
            createdAt: row.createdat
        })); 
    } finally {
        client.release();
    }
}

export const getFilteredStatusProcurements = async (status: string): Promise<Procurement[]> => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT DISTINCT ON (p.id) p.*
            FROM procurements p
            WHERE p.status = $1`, // Filter by status
            [status] // Pass status as a parameter
        );
        return result.rows.map(row => ({
            ...row,
            createdAt: row.createdat
        }));
    } finally {
        client.release();
    }
}

export const getFilteredProcurementsByVendor = async (vendor_id:number): Promise<Procurement[]> => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM procurements WHERE vendor_id = $1', [vendor_id]);
        console.log('result:', result.rows);
        return result.rows.map(row => ({
            ...row,
            createdAt: row.createdat
        }));
    } finally {
        client.release();
    }
};

// export const getFilteredProcurementsByCertificationAndRating = async (certification: string, rating: number): Promise<Procurement[]> => {
//     const client = await pool.connect();
//     console.log ("got here too certification: "+certification+" rating: "+rating);
//     try {
//         let response = await axios.get<Number[]>(`http://host.docker.internal:3001/api/vendors/${certification}/${rating}`);
//         const vendorIds= response.data; // Ensure IDs are integers
//         console.log('vendorIds:', vendorIds);
//         if (vendorIds.length === 0) {
//             return []; // No vendors found, return an empty array
//         }
//         let result = await client.query('SELECT * FROM procurements WHERE vendor_id = ANY($1)', [vendorIds]);
//         return result.rows.map(row => ({
//             ...row,
//             createdAt: row.createdat
//         }));
//     } finally {
//         client.release();
//     }
// }