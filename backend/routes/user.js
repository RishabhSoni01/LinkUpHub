const express = require('express');
const {register,login, logout, updatePassword, updateProfile, deleteMyProfile, myProfile, getUserProfile, getAllUsers, forgotPassword, resetpassword} = require('../controllers/user');
const {isAuthenticated} = require('../middlewares/auth');
const router = express.Router();
const {followUser} = require('../controllers/user');
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/update/password").put(isAuthenticated,updatePassword);
router.route("/update/profile").put(isAuthenticated,updateProfile);
router.route("/follow/:id").get(isAuthenticated,followUser);
router.route("/delete/me").delete(isAuthenticated,deleteMyProfile);
router.route("/me").get(isAuthenticated,myProfile);
router.route("/user/:id").get(isAuthenticated,getUserProfile);
router.route("/users").get(isAuthenticated,getAllUsers);
router.route("/forgot/password").post(isAuthenticated,forgotPassword);
router.route("/password/reset/:token").put(isAuthenticated,resetpassword);


module.exports = router;