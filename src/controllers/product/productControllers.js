const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler")
const Product = require("../../models/products/productModel");


const addProduct = asyncHandler(async (req, res) => {
    const { productName, productImage, productCategory, productPrice, productUnit, productBaseUnit, totalAvailable } = req.body;
    const { storeId } = req.params;
    try {
        if (!productName || !productImage || !productCategory || !productUnit || !productPrice || !totalAvailable || !productBaseUnit) {
            res.status(422);
            throw new Error("Please provide all details!")
        }

        const isProduct = await Product.findOne({ productName: productName, storeId : storeId });
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



module.exports = { addProduct, getProducts, getProductById, changeStatus }