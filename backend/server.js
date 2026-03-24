const express = require('express');
const cors = require('cors');
const assetsRouter = require('./routes/assets');

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/assets', assetsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
