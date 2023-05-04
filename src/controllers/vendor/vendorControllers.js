const Vendor = require("../../models/vendor/vendorModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Store = require("../../models/vendor/storeModel");
const Product = require("../../models/vendor/productModel");

// Authentication 

const register = asyncHandler(async (req, res) => {

    try {
        const { phone, name, email, password } = req.body;

        // checking all details are provided
        if (!phone || !name || !email || !password) {
            throw new Error("You did not provide proper details for registration!")
        }
        // checking in DB that this number is already present or not.
        const isPhonePresent = await Vendor.findOne({ phone: phone });

        if (isPhonePresent) {
            throw new Error("Number already exist!");
        } else {
            const user = { phone, name, email, password, role: "vendor" };
            const newUser = Vendor(user);
            await newUser.save();

            res.status(201).json({ message: "New user created!", newUser });
        }
    } catch (error) {
        throw new Error(error);
    }
});

const login = asyncHandler(async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            throw new Error("You did not provide proper details for authentication!")
        }
        // finding user in database
        const userLogin = await Vendor.findOne({ phone: phone });
        // checking if user is registerd or not
        if (userLogin) {
            // compararing password that is provided by the user with the password in the DB
            const isMatch = await bcrypt.compare(password, userLogin.password);
            if (!isMatch) {
                throw new Error("Invalid Credentials!")
            } else {
                // making user password undefined
                userLogin.password = undefined;
                // generate token for authentication purpose
                const token = jwt.sign({ _id: userLogin._id }, process.env.JWT_SECRET);

                // storing token to cookie and sending success message to frontend
                res
                    .status(201)
                    .cookie("token", token, {
                        expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 100),
                        httpOnly: true,
                    })
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



// Store 

const addStore = asyncHandler(async (req, res) => {
    const { storeName, storeAddress, long, lat, storeType, } = req.body;
    try {
        if (!storeName || !storeAddress || !lat || !long || !storeType) {
            throw new Error("You did not provide proper details for registration!")
        }

        // check is same name store is present or not
        const isStore = await Store.findOne({ storeName: storeName });
        if (isStore) {
            throw new Error("Choose different name!");
        } else {
            const store = { ...req.body, vendorId: req.user._id };
            const newStore = Store(store);
            await newStore.save();

            res.status(201).json({ success: true, message: "Store created!", newStore });
        }

    } catch (error) {
        throw new Error(error);
    }
})

const getAllStore = asyncHandler(async (req, res) => {
    try {
        const stores = await Store.find();
        res.json({ success: true, stores }).status(200);
    } catch (error) {
        throw new Error(error);
    }
})

const getStoreById = asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    try {
        const store = await Store.findById(storeId);
        res.status(200).json({ success: true, store });
    } catch (error) {
        throw new Error(error);
    }
})

const deleteStore = asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    try {
        const getStore = await Store.findById(storeId);

        // checking that the userId stored in address is equal to the userid who want's to delets

        if (getStore.vendorId === req.user._id) {
            res.status(401);
            throw new Error("You cannot perform this action!")
        }


        if (getStore) {
            const deletedStore = await Store.findByIdAndDelete(storeId);
            res.status(200).json({ message: "Store deleted!" });
        }

    } catch (error) {
        throw new Error(error);
    }
})


// product

const addProduct = asyncHandler(async (req, res) => {
    const { productName, productImage, productCategory, productPrice, productUnit } = req.body;
    const { storeId } = req.params;
    try {
        if (!productName || !productImage || !productCategory || !productUnit || !productPrice) {
            res.status(422);
            throw new Error("Please provide all details!")
        }

        const isProduct = await Product.findOne({ productName: productName });
        if (isProduct) {
            throw new Error("Product already listed!");
        }

        const product = { ...req.body, storeId: storeId, vendorId: req.user._id };
        const newProduct = Product(product);
        await newProduct.save();

        res.status(201).json({ success: true, message: "Product listed succefully", newProduct });

    } catch (error) {
        throw new Error(error);
    }
})

const getProducts = asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    try {
        const getProduct = await Product.find({ storeId: storeId });
        res.status(200).json({ success: true, storeId: storeId, getProduct });
    } catch (error) {
        throw new Error(error);
    }
})

const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    try {
        const product = await Product.findById(productId);
        res.status(200).json({ success: true, product });
    } catch (error) {
        throw new Error(error);
    }
})

const changeStatus = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { status } = req.body;
    try {
        const findProduct = await Product.findById(productId);

        // Check if the product is found
        if (!findProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (findProduct.vendorId === req.user._id) {
            res.status(401);
            throw new Error("You cannot perform this action!")
        }

        // Update the status of the product
        findProduct.status = status; // Replace "new status" with the desired status
        // Save the updated product
        await findProduct.save();

        return res.status(200).json({ message: "Product status updated successfully" });

    } catch (error) {
        throw new Error(error);
    }
})



module.exports = { register, login, addStore, getAllStore, getStoreById, deleteStore, addProduct, getProducts, getProductById, changeStatus };

