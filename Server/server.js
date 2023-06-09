const app = require("./app");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/database");

dotenv.config({path:path.join(__dirname,"config/.env")});

connectDB();

const server = app.listen(process.env.PORT,()=>{
    console.log(`My Server is running on port: ${process.env.PORT} in ${process.env.NODE_ENV}`);
})

process.on("unhandledRejection",(err)=>{
    console.log(`Error : ${err.message}`);
    console.log(`Shutting down the server due to unhandled rejection`);
    server.close(()=>{
        process.exit(1);
    })
})

// console.log(a);
process.on("uncaughtException",(err)=>{
    console.log(`Error : ${err.message}`);
    console.log(`Shutting down the server due to uncaught Exception Error`);
    server.close(()=>{
        process.exit(1);
    })
})
