const mongoose = require("mongoose");


const storeSchema = mongoose.Schema({
    storeName: {
        type: String,
        required: true,
    },
    storeAddress: {
        type: String,
        required: true
    },
    landmark: {
        type: String,
        required: true
    },
    long: {
        type: Number,
        required: true
    },
    lat: {
        type: Number,
        required: true
    },
    storeType: {
        type: String,
        required: true
    },
    storeImage: {
        type: String,
        default: "https://previews.agefotostock.com/previewimage/medibigoff/d85902f6ece7feef44eb7dd6dfc59c07/dpa-rva-11665.jpg"
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId, ref: "Vendor"
    },
    like: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client"
        }
    ],
    comments: [
        {
            comment: {
                type: String,
            },
            clientId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Client"
            },
            time : {
                type : String
            }
        }
    ],
    status : {
        type : String,
        default : "Active"
    }
}, { timestamps: true })

const Store = mongoose.model("Store", storeSchema);
module.exports = Store;