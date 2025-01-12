import { Pool } from 'pg';
import { Vendor } from '../models/vendor';
import axios from 'axios';

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'vendor_db',
    password: process.env.DB_PASSWORD || 'password',
    port: Number(process.env.DB_PORT) || 5432,
});

export const getVendors = async (): Promise<Vendor[]> => {
    const result = await pool.query('SELECT * FROM vendors');
    return result.rows;
};

export const addVendor = async (vendor: Partial<Vendor>): Promise<Vendor> => {
    const { name, location, certifications, rating } = vendor;
    const result = await pool.query(
        'INSERT INTO vendors (name, location, certifications, rating) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, location, certifications || [], rating || 0]
    );
    return result.rows[0];
};

export const getVendorPercurmentsById = async (vendorId: string) =>{
    const client = await pool.connect();

    try {
        // Fetch vendor data from mock API and type the response
        let response = await axios.get(`http://host.docker.internal:3000/${vendorId}`);
        let vendor = response.data as { procurements: { id: string, title: string, description: string, items: any[] }[] };

        // Insert procurements into the database
        for (const procurement of vendor.procurements) {
            await client.query(
                `INSERT INTO procurements(id, title, description, items, vendor_id)
                 VALUES($1, $2, $3, $4, $5)
                 ON CONFLICT (id) DO NOTHING`,
                [
                    procurement.id, // Use procurement.id instead of procurment.id
                    procurement.title,
                    procurement.description,
                    JSON.stringify(procurement.items), // Convert items array to JSON
                    vendorId,
                ]
            );
        }

        console.log('Mock data inserted successfully!');
        return vendor;
    } catch (error) {
        console.error('Error inserting mock data:', error);
        throw new Error('Failed to insert mock data');
    } finally {
        client.release();
    }
};

