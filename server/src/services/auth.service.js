const User = require('../models/User.model')
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt.utils')

const registerUser = async (name, email, password) => {
    // check user already register hai ya nahi
    const existingUser = await User.findOne({ email })

    if (existingUser) {
        const error = new Error('Email already registered')
        error.statusCode = 409
        throw error
    }

    // user create karo — await zaroori hai, warna user Promise object rahega
    // password automatically hash hoga User.model.js ke pre-save hook se
    const user = await User.create({ name, email, password })

    // tokens generate karo — user._id ab available hai kyunki user save ho gaya
    const accessToken = generateAccessToken(user._id, user.role)
    const refreshToken = generateRefreshToken(user._id)

    // password response mein nahi jaana chahiye — security risk
    // chahe hashed ho, phir bhi client ko nahi dikhana
    user.password = undefined

    return { user, accessToken, refreshToken }
}

module.exports = { registerUser }