const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    productImage: {
        type: String,
        required: true
    },
    productCategory: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        requierd: true
    },
    productBaseUnit: {
        type: Number,
        required: true,
    },
    productUnit : {
        type : String,
        required : true
    },
    totalAvailable : {
        type : Number,
        required : true
    },
    status : {
        type : String,
        required : true,
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId, ref: "Store"
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId, ref: "Vendor"
    }
}, { timestamps: true });


const Product = mongoose.model("Product", productSchema);
module.exports = Product;