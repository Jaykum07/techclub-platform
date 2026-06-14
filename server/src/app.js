const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const errorHandler = require('./middleware/error.middleware');

const app = express()

// helmet — security headers automatically set karta hai
// OWASP A05 — misconfiguration se bachata hai
// X-Powered-By header remove karta hai — attacker ko pata nahi chalega
// ki server Express use kar raha hai
app.use(helmet())

// cors — sirf allowed origin se requests accept karo
// CLIENT_URL .env se aayega — hardcode nahi kiya
// OWASP A05 — * nahi lagaya — sirf frontend ka URL allowed hai
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // cookies aur auth headers allow karta hai
}))

// morgan — har HTTP request ka log console mein dikhata hai
// format: GET /api/health 200 3ms
// OWASP A09 — logging zaroori hai debugging aur monitoring ke liye
app.use(morgan('dev'))

// rate limiter — ek IP se 15 minutes mein max 100 requests
// OWASP A07 — brute force attacks se bachata hai
// sirf /api routes pe lagaya — static files pe nahi
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes milliseconds mein
    max: 100,                   // max requests per window
    message: {
        status: 'error',
        message: 'Too many requests, please try again later',
    },
})
app.use('/api', limiter)

// body parser — request body ko JSON se JavaScript object mein convert karta hai
// bina iske req.body undefined hoga
app.use(express.json({ limit: '10kb' })) // OWASP A04 — large payload attacks se bachao

// ---- HEALTH CHECK ROUTE ----
// server chal raha hai ya nahi verify karne ke liye
// deployment ke baad bhi ye route check karte hain
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is running',
        environment: process.env.NODE_ENV,
    })
})

// error handler — hamesha sabse last middleware hota hai
// saare routes ke baad — agar koi error throw hua toh yahan aayega
app.use(errorHandler)

module.exports = app