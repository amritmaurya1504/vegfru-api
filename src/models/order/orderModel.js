const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
    orderDate: {
        type: String
    },
    billDetails: {
        type: {
            tax: Number,
            mrp: Number,
            deliveryFair: Number,
            totalBill: Number
        }
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId, ref: "Client"
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId, ref: "Vendor"
    },
    receipt: {
        type: String
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId, ref: "Store"
    },
    toAddress: {
        type: mongoose.Schema.Types.ObjectId, ref: "Address"
    },
    itemsOrdered: {
        type: Array,
        default: []
    },
    paymentDetails: {
        type: {
            orderId: String,
            intentId: String,
            created: String,
            paymentId: String,
            payment_method_types: String,
            payment_status: String
        }
    },
    orderStatus: {
        type: String
    }
}, { timestamps: true })


const Order = mongoose.model("Order", orderSchema);
module.exports = Order;