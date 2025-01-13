import { ProcurementStatus } from './ProcurementStatus';

export interface Procurement {
    id: string;
    title: string;
    description: string;
    items: { itemName: string; quantity: number }[];
    status: ProcurementStatus;
    createdat: Date;
    vendor_id: number;
}