const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Vendor = require("../models/vendor/vendorModel");


const isVerifiedVendor = asyncHandler(async (req, res, next) => {
    try {
        // geting auth tokens from cookies
        const { authorization } = req.headers;
        // console.log("Token, " ,authorization)

        // checking that token is avaialable or not
        if (!authorization) {
            res.status(401);
            throw new Error("Please Provide authorization header!")
        }

        const token = authorization.replace("Bearer ", "");

        jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                return res.status(401).json({ error: "Invalid Vendor's token!" })
            }

            console.log(payload)
            const { _id } = payload;
            Vendor.findById(_id).then(userData => {
                req.user = userData;
                next();
            })
        })

    } catch (error) {
        throw new Error(error);
    }
})


module.exports = { isVerifiedVendor };