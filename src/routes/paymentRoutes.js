const express = require("express");
const router = express.Router();
const { createCheckoutSession, paymentWebHook } = require("../controllers/payment/stripe.integration");
const { isVerifiedUser } = require("../middlewares/verifyUser");

router.route("/create-checkout-session").post(isVerifiedUser, createCheckoutSession);
router.route("/webhook").post(express.raw({ type: 'application/json' }), paymentWebHook);

module.exports = router