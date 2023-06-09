const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Name"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter Valid E-mail Address"]  //to checking the Email valid or not we use validator npm package - isEmail package is validate 
  },
  password: {
    type: String,
    required: [true, "Please Enter Password"],
    maxlength: [6, "Password Can't Exceed 6 Char"],
    select:false  //when the user comes to view their profile initally they login and use get method of myprofile route - Hashed password is not selected so we use select false
  },
  avatar: {
    type: String, 
  },
  role: {
    type: String,
    default: 'user',
  },

  resetPasswordToken: String,
  resetPasswordTokenExpire: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  }
})

userSchema.pre('save', async function(next){
  // console.log('onsave',this.password)
    if(!this.isModified('password')){
      next();   //if this return false mean we call next function do operations;
    }
    this.password = await bcrypt.hash(this.password,10)
})

userSchema.methods.getJwtToken = function(){
    return jwt.sign({id: this.id},process.env.JWT_SECRET,{  //By using of secret key generator(randomkeygen.com) here am using 128-bit web keys method of code
        expiresIn:process.env.JWT_EXPIRES_TIME
    })
}

userSchema.methods.isValidPassword =async function(enteredPassword){
   return bcrypt.compare(enteredPassword,this.password)
}

userSchema.methods.getResetToken = function(){
  
  // Generate Token use crypto npm pakage
  const token = crypto.randomBytes(20).toString("hex");

  // Generate Hash And set to resetPasswordToken
  this.resetPasswordToken = crypto.createHash(`sha256`).update(token).digest('hex');   //By using createHash method to the generated token will be hashed and digest is the cryptography method

  // set token expire time
  this.resetPasswordTokenExpire = Date.now() + 30 * 60 * 1000;  //after 30min this token is expired in this line
  return token
}

let model = mongoose.model("User", userSchema);

module.exports = model;
