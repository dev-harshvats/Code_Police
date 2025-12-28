const express = require('express');
const cors = require('cors');
require('dotenv').config();
// Import Cron Service
const { startCron } = require('./src/services/cronService'); 

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',    
    credentials: true   
}));

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/stats', require('./src/routes/statsRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    
    // Start the background update loop
    startCron(); 
});