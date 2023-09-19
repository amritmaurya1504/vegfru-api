const Client = require("../../models/client/clientModel");
const Address = require("../../models/client/addressModel")
const Store = require("../../models/vendor/storeModel")
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { redisClient } = require("../../cache/redisClient")


//Desc Register users
//@route POST /api/user/register
//@access public

const register = asyncHandler(async (req, res) => {

    try {
        const { phone, name, email, password } = req.body;

        // checking all details are provided
        if (!phone || !name || !email || !password) {
            res.status(422);
            throw new Error("You did not provide proper details for registration!")
        }
        // checking in DB that this number is already present or not.
        const isPhonePresent = await Client.findOne({ phone: phone });

        if (isPhonePresent) {
            throw new Error("Number already exist!");
        } else {
            const user = { phone, name, email, password };
            const newUser = Client(user);
            await newUser.save();

            res.status(201).json({ message: "New user created!", newUser });
        }
    } catch (error) {
        throw new Error(error);
    }
});

// Desc Email Verification 
// @router

//Desc Login users
//@route POST /api/user/login
//@access public

const login = asyncHandler(async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            res.status(422);
            throw new Error("You did not provide proper details for authentication!")
        }
        // finding user in database
        const userLogin = await Client.findOne({ phone: phone });
        // checking if user is registerd or not
        if (userLogin) {
            // compararing password that is provided by the user with the password in the DB
            const isMatch = await bcrypt.compare(password, userLogin.password);
            if (!isMatch) {
                res.status(401);
                throw new Error("Invalid Credentials!")
            } else {
                // making user password undefined
                userLogin.password = undefined;
                // generate token for authentication purpose
                const token = jwt.sign({ _id: userLogin._id }, process.env.JWT_SECRET);

                // storing token to cookie and sending success message to frontend
                res
                    .status(201)
                    .json({
                        message: "User Login Sucessfully!",
                        userLogin,
                        token
                    });
            }
        } else {
            throw new Error("User does not exist!")
        }

    } catch (error) {
        throw new Error(error);
    }
})


//Desc get logged in user data
//@route GET /api/user/
//@access protected

const getLoggedUser = asyncHandler(async (req, res) => {
    try {
        const user = await Client.findById(req.user._id);
        return res.json(user);
    } catch (error) {
        res.json(error);
    }
});

const logout = asyncHandler(async (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ success: true });
    } catch (error) {
        throw new Error(error)
    }
})


//Desc Add Address
//@route POST /api/user/add-address
//@access protected

const addAddress = asyncHandler(async (req, res) => {
    const { place, long, lat, address, landmark, type } = req.body;

    if (!place || !long || !lat || !address || !landmark || !type) {
        res.status(422);
        throw new Error("You did not provide proper details!");
    }
    try {
        const newAddress = { place, long, lat, address, landmark, userId: req.user._id, type };
        const savedAddress = new Address(newAddress);
        await savedAddress.save();

        res.status(201).json({ message: "New address created!" });
    } catch (error) {
        throw new Error(error);
    }
})


//Desc Get all Address
//@route GET /api/user/get-alladdress
//@access protected

const getAllAddress = asyncHandler(async (req, res) => {
    try {
        const getAddress = await Address.find({ userId: req.user._id });
        if (!getAddress) {
            throw new Error("Something went wrong!");
        }

        res.status(200).json(getAddress);

    } catch (error) {
        throw new Error(error);
    }
})

//Desc Get Address by ID
//@route GET /api/user/get-alladdress/:addressId
//@access protected

const getAddressById = asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    try {
        const getAddress = await Address.findById(addressId);
        if (getAddress.length == 0 || !getAddress) {
            throw new Error("Something went wrong!");
        }

        res.status(200).json(getAddress);

    } catch (error) {
        throw new Error(error);
    }
})


//Desc Delete Address by ID
//@route DELETE /api/user/delete-address/:addressId
//@access protected

const deleteAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    try {
        const getAddress = await Address.findById(addressId);

        // checking that the userId stored in address is equal to the userid who want's to delets

        if (getAddress.userId === req.user._id) {
            res.status(401);
            throw new Error("You cannot perform this action!")
        }


        if (getAddress) {
            const deletedAddress = await Address.findByIdAndDelete(addressId);
            res.status(200).json({ message: "Address deleted!" });
        }

    } catch (error) {
        throw new Error(error);
    }
})

//Desc get all stores
//@route GET /api/user/get-allstores
//@access public
//! REDIS CACHING IS USED HERE

const getAllStores = asyncHandler(async (req, res) => {
    try {

        const cachedValue = await redisClient.get("allStores")
        if (cachedValue) return res.json({ success: true, stores: JSON.parse(cachedValue)}).status(200);

        const stores = await Store.find().populate(
            {
                path: "comments.clientId",
                select: "name email"
            }
        );
        redisClient.set("allStores", JSON.stringify(stores))
        redisClient.expire("allStores", process.env.DEFAULT_EXPIRATION)
        res.json({ success: true, stores }).status(200);
    } catch (error) {
        throw new Error(error);
    }
})


// Rate & Review Stores
const reviewFun = asyncHandler(async (req, res) => {
    const { radio, review, storeId } = req.body;
    try {

        if (!radio || !review || !storeId) {
            res.status(422);
            throw new Error("Please provide all details!")
        } else {
            const reqview = {
                comment: review,
                clientId: req.user._id,
                time: new Date()
            }
            const findStore = await Store.findById(storeId);


            if (findStore) {
                // progress..........  
                // if(findStore.like.includes(req.user._id)){
                //     throw new Error("You already rated!")
                // }

                const isRated = await Store.findByIdAndUpdate(storeId,
                    { $push: { like: req.user._id, comments: reqview } },
                    { new: true }
                )

                res.json({ success: true, isRated }).status(201)
            } else {
                res.status(404);
                throw new Error("Store not found!")
            }
        }
    } catch (error) {
        throw new Error(error)
    }
})




module.exports = { register, login, getLoggedUser, logout, addAddress, getAllAddress, getAddressById, deleteAddress, getAllStores, reviewFun };

