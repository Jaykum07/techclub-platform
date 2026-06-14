const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500 // kabhi error undefined aayi to use hoga 500
    const message = err.message || 'Internal Server Error' // same as

    res.status(statusCode).json({
        success: false,
        message: message,
        // stack trace sirf development mein dikhega
        // production mein client ko internal code structure pata nahi chalna chahiye
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    })
}

module.exports = errorHandler