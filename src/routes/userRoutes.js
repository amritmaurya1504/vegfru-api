const express = require("express");
const router = express.Router(); // --> initialize express router
const { register, login, getLoggedUser, logout , addAddress, getAllAddress, getAddressById, deleteAddress } = require("../controllers/client/userControllers")
const { isVerifiedUser } = require("../middlewares/verifyUser");


// Authentication Routes
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/").get(isVerifiedUser, getLoggedUser)
router.route("/logout").get(isVerifiedUser,logout)

// Address Routes
router.route("/add-address").post(isVerifiedUser ,addAddress);
router.route("/get-alladdress").get(isVerifiedUser, getAllAddress);
router.route("/get-address/:addressId").get(isVerifiedUser, getAddressById);
router.route("/delete-address/:addressId").delete(isVerifiedUser, deleteAddress);


module.exports = router;