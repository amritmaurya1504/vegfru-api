const jwt = require("jsonwebtoken");
const Client = require("../models/client/clientModel");
const asyncHandler = require("express-async-handler")


const isVerifiedUser = asyncHandler(async (req, res, next) => {
    try {
        // geting auth tokens from cookies
        const { accessToken } = req.cookies;
        // checking that token is avaialable or not

        if (!accessToken) {
            res.status(401);
            throw new Error("Please Provide token!")
        }
        
        const decodeToken = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
        try {
            req.user = await Client.findById(decodeToken._id);
            next();
        } catch (error) {
            return res.status(401).json({
                error: "Some Problem in Cookies or Invalid Token!",
            });
        }

    } catch (error) {
        res.status(401);
        throw new Error(error);
    }
})


module.exports = { isVerifiedUser };