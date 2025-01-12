import app from './app';

import procurementController from './controllers/procurementController';

const PORT = process.env.PORT || 3002;

app.use('/inventoryLevels', procurementController);// inventory data task number 2 
app.use('/filter-by-quantity' , procurementController);//filter procurements by quantity. task 4
app.use('/filter-by-status',procurementController);

app.get('/', (req, res) => res.send('Procurement Service is running!'));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Procurement Service listening on port ${PORT}`);
});
