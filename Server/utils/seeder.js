const products = require("../data/products.json");
const Product = require("../models/productModel");
const dotenv =  require("dotenv");
const connectDB = require("../config/database");

dotenv.config({path:"server/config/.env"});
connectDB();

const seedProducts = async () => {
  try {
    await Product.deleteMany();
    console.log("Products Deleted..!");
    await Product.insertMany(products);
    console.log("All Products Added..!");
  } catch (error) {
    console.log(error.message);
  }
  process.exit();   //-To stop node code 
};


seedProducts();