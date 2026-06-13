//dotenv sabse pehle baki sb process.env use krte hai
// agar baad m load kiya to variables undefined honge

require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

//database connect karne ka function
// async isliye kyuki mongoose.connect() promise return karta hai
// const connectDB = async() => {
//     try{
//         const conn = await mongoose.connect(process.env.MONGODB_URI);
//         console.log(`MongoDB connected: ${conn.connection.host}`);

//     }catch(err){
//         // OWASP A09 - error properly log kro
//         console.log(err);
//         console.log(`Database connection failed: ${err.message}`);

//         //database connect nahi huaa to server band kro
//         // bina database ke server chalana dangerous hai
//         //requests aayegi pr data save nhi hoga

//         process.exit(1) // 1 = failure code

//     }
// }

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4,  // IPv4 force karo — IPv6 issue fix hoga
        })
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (err) {
        console.error(`Database connection failed: ${err.message}`)
        process.exit(1)
    }
}

//server starting function
//first of all DB connect karenge then server start krenge
const startServer = async() =>{
    //first database connect
    await connectDB();

    //if database connected then server running succesfully otherwise not
    app.listen(PORT, ()=>{
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
    })
}

//server start calling
startServer();