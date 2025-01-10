import app from './app';

const procurementService = require('./services/procurement-service');

const PORT = process.env.PORT || 3002;

app.get('/', (req, res) => res.send('Procurement Service is running!'));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.use('/inventory', procurementService);// this is my addition to add inventory data.

app.listen(PORT, () => {
  console.log(`Procurement Service listening on port ${PORT}`);
});
