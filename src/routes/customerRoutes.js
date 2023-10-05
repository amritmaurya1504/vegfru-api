const express = require("express");
const router = express.Router(); // --> initialize express router
const { register, login, getLoggedUser, logout , refresh, addAddress, getAllAddress, getAddressById, deleteAddress, getAllStores, getStoreById, reviewFun } = require("../controllers/client/customerControllers")
const { isVerifiedUser } = require("../middlewares/verifyUser");


// Authentication Routes
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/").get(isVerifiedUser, getLoggedUser)
router.route("/logout").get(isVerifiedUser,logout)
router.route("/refresh").get(refresh);

// Address Routes
router.route("/add-address").post(isVerifiedUser ,addAddress);
router.route("/get-alladdress").get(isVerifiedUser, getAllAddress);
router.route("/get-address/:addressId").get(isVerifiedUser, getAddressById);
router.route("/delete-address/:addressId").delete(isVerifiedUser, deleteAddress);


// get stores datas
router.route("/get-stores").get(getAllStores); // caching done
router.route("/get-store/:storeId").get(getStoreById)

// rate stores
router.route("/store/rate").post(isVerifiedUser, reviewFun)


module.exports = router;