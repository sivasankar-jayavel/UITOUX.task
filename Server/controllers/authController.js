const catchAsyncError = require("../middlewares/catchAsyncError");
const User = require("../models/userModel");
const sendEmail = require("../utils/email");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwt");
const crypto = require("crypto");

// Register User - /api/v1/register
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password} = req.body;

  let avatar ;
  if(req.file){
    avatar = `${process.env.BACKEND_URL}/uploads/user/${req.file.originalname}`
  }

  const user = await User.create({
    name,
    email,
    password,
    avatar,
  });

  //  const token = user.getJwtToken();
  //  res.status(201).json({
  //     success: true,
  //     user,
  //     token
  //  })

  sendToken(user, 201, res); //above commanding line short form is this one line in util jws folder
});



// Login User - /api/v1/login
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }

         // Finding the user Database
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

         // to check password
  if (!await user.isValidPassword(password)){
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  sendToken(user, 201, res);
});



// Logout User - /api/v1/logout
exports.logoutUser = (req, res, next) => {
  res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .status(200)
    .json({
      success: true,
      message: "Loggedout"
    })
}


// Forgot Password - /api/v1/forgot
exports.forgotPassword = catchAsyncError(async (req, res, next) => {

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found in this E-mail", 404));
 }

  //if user found we generate token for that user 
  const resetToken = user.getResetToken();
  await user.save({ validateBeforeSave: false })

  //  create Reset url
  const resetUrl = ` ${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const message = `Your Password Reset Token URL is as Follows
                  \n\n            
                  ${resetUrl}
                  \n\n 
                  If You Have Not requested this email,then ignore it.`;

  try {
    sendEmail({
        email:user.email,
        subject: "Car-Spare Password Recovery",
        message
    })

    res.status(200).json({
        success: true,
        message: `Email send to ${user.email}`
    });

  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({validateBeforeSave:false});
    return next(new ErrorHandler(error.message), 500)
  }
});

// Reset Password - api/v1/password/reset/:token
exports.resetPassword = catchAsyncError(async(req,res,next) =>{
 const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')   //by using of crypto package use createHash method sha256 is a algorithm and update  method is having original value to call digest method to encoding 'hex' - so we get hash value
   
   const user = await User.findOne({
    resetPasswordToken,
    resetPasswordTokenExpire: { $gt: Date.now() }
  })

   if(!user){
    return next(new ErrorHandler('Password reset token is Invalid or Expired'));
   }

   if(req.body.password !== req.body.confirmPassword){
    return next(new ErrorHandler('Password Does Not Match'));
   }

   user.password = req.body.password;
   
   user.resetPasswordToken = undefined;
   user.resetPasswordTokenExpire = undefined;
   await user.save({validateBeforeSave:false})
   sendToken(user, 201, res);

  });


// Get user Profile - api/v1/myProfile
    exports.getUserProfile = catchAsyncError(async (req,res,next) =>{
      const user = await User.findById(req.user.id)
      res.status(200).json({
        success : true,
        user
      })
    })


// change Password - /api/v1/password/change
    exports.changePassword = catchAsyncError(async(req,res,next) =>{
      const user = await User.findById(req.user.id).select('+password')  //here (req.user.id) its not returning password and by default we are select password is false so we need password means use '+password' to use show the password 
      // check old password is matching or not
      if(!await user.isValidPassword(req.body.oldPassword)){
        return next(new ErrorHandler('Old password is not matching'));
      }

      // assigning new password
       user.password = req.body.password;
       await user.save();
       res.status(200).json({
        success : true,
      }) 
    })


// Update Profile - /api/v1/update
   exports.updateProfile = catchAsyncError(async(req,res,next)=>{
    var newUserData = {
      name:req.body.name,
      email:req.body.email
    }

    let avatar ;
    if(req.file){
      avatar = `${process.env.BACKEND_URL}/uploads/user/${req.file.originalname}`
      newUserData = {...newUserData,avatar}
    }

   const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
      new:true,   //it return new values old values are update here
      runValidators:true,
    })
    res.status(200).json({
      success : true,
      user   //it return updated values of user
    }) 

   })


  //Admin - Get All Users - /api/v1/admin/users
exports.getAllUsers = catchAsyncError(async(req,res,next)=>{
  const users = await User.find();
  res.status(200).json({
    success : true,
    users   //its find and return all users
  }) 
})


  //Admin - Get Specific User - /api/v1/admin/user/:id 
  exports.getUser = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user){
      return next(new ErrorHandler(`User not found with this id ${req.params.id}`));
    }
    res.status(200).json({
      success : true,
      user   //its find the ID pf Particular user and return that user
  })
});

// Admin - Update User - /api/v1/admin/user/:id
exports.updateUser = catchAsyncError(async(req,res,next)=>{
  const newUserData = {
    name:req.body.name,
    email:req.body.email,
    role:req.body.role
  }
 const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
    new:true,   //it return new values old values are update here
    runValidators:true,
  })
  res.status(200).json({
    success : true,
    user   //it return updated values of user
  }) 
})


// Admin - Delete User - /api/v1/admin/user/:id
exports.deleteUser = catchAsyncError(async(req,res,next)=>{
  const user = await User.findByIdAndRemove(req.params.id);
  if(!user){
    return next(new ErrorHandler(`User not found with this id ${req.params.id}`));
  }
  res.status(200).json({
    success : true
  }) 
})


