const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


// creating mondoDB Client model
const clientSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                return /\d{10}/.test(v); // validate that number is a 10-digit number
            },
            message: "Phone number must be a 10-digit number",
        },
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /\S+@\S+\.\S+/.test(v); // validate that email is in a valid format
            },
            message: "Email must be in a valid format",
        },
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true })


clientSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const Client = mongoose.model("Client", clientSchema);
module.exports = Client;