import express from 'express';
import cors from 'cors';
import './loadEnvironment.mjs';
import 'express-async-errors';
import snippets from './routes/snippets.mjs';

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

// Load the /snippets routes
app.use('/api/snippets', snippets);

// Global error handling
app.use((err, _req, res, _) => {
  console.error(err);
  res.status(500).send('Uh oh! An unexpected error occured.');
})

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});