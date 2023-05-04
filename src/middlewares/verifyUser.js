const jwt = require("jsonwebtoken");
const Client = require("../models/client/clientModel");
const asyncHandler = require("express-async-handler")


const isVerifiedUser = asyncHandler(async (req, res, next) => {
    try {
        // geting auth tokens from cookies
        const { authorization } = req.headers;

        // checking that token is avaialable or not
        if (!authorization) {
            res.status(401);
            throw new Error("You Must be Logged in")
        }

        const token = authorization.replace("Bearer ", "");

        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if (err) {
                return res.status(401).json({ error: "You Must be Loggeg in" })
            }

            const { _id } = payload;
            Client.findById(_id).then(userData => {
                req.user = userData;
                next();
            })
        })

    } catch (error) {
        throw new Error(error);
    }
})


module.exports = { isVerifiedUser };