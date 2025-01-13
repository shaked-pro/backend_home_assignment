import { Pool } from 'pg';
import { Vendor } from '../models/vendor';
import axios from 'axios';

//import { addProcurement } from '../../../procurement-service/src/services/procurementService';

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
    try {
        // Fetch vendor data from mock API and type the response
        let intVendorId = parseInt(vendorId);
        intVendorId = intVendorId-1; //since the vendor id starts from 1 and the array index starts from 0
        let response = await axios.get(`http://host.docker.internal:3000/${intVendorId}`);
        let vendor = response.data as { procurements: { id: string, title: string, description: string, items: any[] }[] };
        intVendorId = intVendorId+1; //adjusting back to the original vendor id

        console.log ("vendor data:", JSON.stringify(vendor));
        if (!vendor || !Array.isArray(vendor.procurements)) {
            console.error('Invalid vendor data:', JSON.stringify(vendor, null, 2));
            throw new Error('Invalid vendor data');
        }
        
        // Insert procurements into the database
        for (const procurement of vendor.procurements) {
            let {id, ...procurementData} = procurement;
            let procurementDataWithVendor = {...procurementData, vendor_id:intVendorId};
            await axios.post('http://host.docker.internal:3002/api/procurements', procurementDataWithVendor);

        }

        console.log('Mock data inserted successfully!');
        return vendor;
    } catch (error) {
        console.error('Error inserting mock data:', error);
        throw new Error('Failed to insert mock data');
    } 
};

// export const getFilteredProcurementsByVendor = async (vendorId: string) => {

// }
