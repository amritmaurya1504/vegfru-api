const mongoose = require("mongoose");


const storeSchema = mongoose.Schema({
    storeName : {
        type : String,
        required : true,
    },
    storeAddress : {
        type : String,
        required : true
    },
    long : {
        type : Number,
        required : true
    },
    lat : {
        type : Number,
        required : true
    },
    storeType : {
        type : String,
        required : true
    },
    storeImage : {
        type : String,
        default : "https://media.istockphoto.com/id/1280995985/photo/street-vegetable-seller-showing-mobile-phone.jpg?s=612x612&w=0&k=20&c=IySJcvRMWnfe1tieuPldSWbnxkLiGwiZTrleEZzy_AQ"
    },
    vendorId : {
        type : mongoose.Schema.Types.ObjectId, ref : "Vendor"
    }
}, { timestamps : true })

const Store = mongoose.model("Store", storeSchema);
module.exports = Store;