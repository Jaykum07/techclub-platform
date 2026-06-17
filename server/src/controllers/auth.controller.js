const { registerUser, loginUser } = require('../services/auth.service')

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body

        const result = await registerUser(name, email, password)

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result,
        })
    } catch (err) {
        next(err)
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const result = await loginUser(email, password)

        return res.status(200).json({
            success: true,  
            message: 'Login successful',
            data: result,
        })
    } catch (err) {
        next(err)
    }
}

module.exports = { register, login }