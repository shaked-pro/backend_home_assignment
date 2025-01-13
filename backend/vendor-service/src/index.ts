import app from './app';
import procurementController from './controllers/vendorController';

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => res.send('Vendor Service is running!'));
app.use('/:id/procurements/create', procurementController);
app.use('/:id/procurements/view', procurementController);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Vendor Service listening on port ${PORT}`);
});
