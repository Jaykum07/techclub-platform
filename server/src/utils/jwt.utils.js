const jwt = require('jsonwebtoken')

// access token banata hai — short lived (15 minutes)
// har API request mein bheja jaata hai Authorization header mein
// payload mein userId aur role store hota hai
const generateAccessToken = (userId, role) => {
    return jwt.sign(
        { userId, role },           // jo data token mein store karna hai
        process.env.JWT_SECRET,     // secret key — .env se aati hai
        { expiresIn: '15m' }        // 15 min baad expire — security ke liye
    )
}

// refresh token banata hai — long lived (7 days)
// sirf naya access token lene ke liye use hota hai
// jab access token expire ho jaaye tab refresh token bhejte hain
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    )
}

// token verify karta hai
// agar token valid hai → decoded payload return karta hai
// agar token invalid ya expired hai → error throw karta hai
const verifyToken = (token, secret) => {
    return jwt.verify(token, secret)
}

// Node.js mein export aise hota hai — ES Modules wala nahi
module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
}