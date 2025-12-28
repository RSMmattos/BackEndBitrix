const express = require('express');
const cors = require('cors');
const { BASE_URL } = require('./config');
const helmet = require('helmet');
require('dotenv').config();

const gccustoRoutes = require('./routes/gccusto');
const bgcatividadeRoutes = require('./routes/bgcatividade');
const batividadegRoutes = require('./routes/batividadeg');
const usuarioRoutes = require('./routes/usuario');
const relatorioRoutes = require('./routes/relatorio');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
// CORS aberto para qualquer origem
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/gccusto', gccustoRoutes);
app.use('/api/bgcatividade', bgcatividadeRoutes);
app.use('/api/batividadeg', batividadegRoutes);
app.use('/api/usuario', usuarioRoutes);
app.use('/api/relatorio', relatorioRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});