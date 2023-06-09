const express = require("express");
const app = express();
const path = require('path');
const errorMiddleware = require("./middlewares/error");
const cookieParser = require("cookie-parser");

// const dotenv = require("dotenv");
// dotenv.config({path:path.join(__dirname,"config/.env")});

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());  //by using this avoid error on cookies creation in authenticate.js

app.use('/uploads',express.static( path.join(__dirname,'uploads')) )

const products = require("./routes/product") ;
const auth = require("./routes/auth") ;
const order = require("./routes/order");

app.use("/api/v1/",products) ;
app.use("/api/v1/",auth) ;
app.use("/api/v1/",order) ;

app.use(errorMiddleware);

module.exports = app;