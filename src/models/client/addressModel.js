const mongoose = require("mongoose");

const addressSchema = mongoose.Schema({
    place : {
        type : String,
        required : true
    },
    long : {
        type : Number,
        required : true,
    },
    lat : {
        type : Number,
        required : true
    },
    address : {
        type : String,
        required : true,
    },
    landmark : {
        type : String,
        required : true,
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId, ref : "Client",
    },
    type : {
        type : String,
        required : true
    }
} , { timestamps : true });


const Address = mongoose.model("Address", addressSchema);
module.exports = Address;