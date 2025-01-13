CREATE TABLE IF NOT EXISTS procurements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    items JSON NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    vendor_id INT 
);

INSERT INTO procurements (title, description, items, status) VALUES
('Request A', 'Need 100 units of Item X', '[{"itemName":"Item X","quantity":100}]', 'open'),
('Request B', 'Need 50 units of Item Y', '[{"itemName":"Item Y","quantity":50}]', 'in-review');