const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { startCron } = require('./src/services/cronService'); 

const app = express();

app.use(express.json());

// --- DEBUGGING LOGS (Add this block) ---
console.log("--------------------------------------------------");
console.log("SERVER STARTUP DEBUG:");
console.log("1. Environment Mode:", process.env.NODE_ENV);
console.log("2. Frontend URL Var:", process.env.FRONTEND_URL); // Is this undefined?
console.log("3. Fallback Origin:", 'http://localhost:3000');
console.log("--------------------------------------------------");

app.use(cors({
    // If log #2 is undefined, this WILL use localhost
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',    
    credentials: true   
}));

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/stats', require('./src/routes/statsRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    startCron(); 
});