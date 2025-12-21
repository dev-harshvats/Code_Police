const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',    // Allow only port 3000 Next.js frontend
    credentials: true   // Allow cookies/headers to be sent
}));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/stats', require('./src/routes/statsRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    if(PORT == 5000){
        console.log(`Server started on http://localhost:${PORT}`);
    } else{
        console.log(`Server started on port ${PORT}`);
    }
});