const express = require("express");
const multer = require('multer');

const path = require('path');

const upload = multer ({storage:multer.diskStorage({
  destination:function(req,file,cb){  //cb is callback
    cb(null,path.join(__dirname,"..",'uploads/user'))  
//Here inital value is null,request folder will upload on second path so we create path (uploads/user) folder in backend -this method will not understand multer so we use path(join function is add all the single path in one way) module for exact route folder - one step back we use ("..") 
  },
  filename:function(req,file,cb){
    cb(null,file.originalname)
  }
}) })

const { 
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  changePassword,
  updateProfile,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/authController");
const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/autheticate');

const router = express.Router();

router.route("/register").post(upload.single('avatar'),registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/myProfile").get(isAuthenticatedUser, getUserProfile);
router.route("/password/change").put(isAuthenticatedUser, changePassword);
router.route("/update").put(isAuthenticatedUser,upload.single('avatar'), updateProfile);

// Admin Routes
router.route("/admin/users").get(isAuthenticatedUser,authorizeRoles('admin'),getAllUsers);
router.route("/admin/user/:id").get(isAuthenticatedUser,authorizeRoles('admin'),getUser)
                               .put(isAuthenticatedUser,authorizeRoles('admin'),updateUser)
                               .delete(isAuthenticatedUser,authorizeRoles('admin'),deleteUser);

module.exports = router;
