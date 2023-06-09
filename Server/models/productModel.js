const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
        maxLength : [90,"Product name can't exceed 100 char"]
    },
    price : {
        type : Number,
        // required : true,
        default : 0.0
    },
    description : {
        type : String,
        required : [true,"Please enter product description"]
    },
    ratings : {
        type : String,
        default : 0
    },
    images : [
        {
            image : {
                type : String,
                required : true
            }
        }
    ],
    catagory : {
        type : String ,
        required :[ true , "Please enter product catagory"],
        enum : {
            values : [
                "Interiors spares",
                "Exteriors spares",
                "Liquids",
                "Service"
            ],
            message : "Please enter valid catagory"
        }
    },
    seller : {
        type :String,
        required : [ true , "Please enter seller name"],
    },
    stock : {
        type : Number,
        required : [ true , "Please Enter Product stock"],
        maxLength :  [ 25 , "Product name can't exceed 25 char" ]
    },
    numOfReviews : {
        type : Number,
        default : 0
    },
    reviews : [
        {
            user : mongoose.Schema.Types.ObjectId,
            rating : {
                type : String,
                required : true
            },
            comment : {
                type :String,
                required : true
            }
        }
    ],
    user:{
      type : mongoose.Schema.Types.ObjectId
    },
    createdAt : {
        type : Date,
        default : Date.now()
    }
});

let schema = mongoose.model("product",productSchema)

module.exports = schema 