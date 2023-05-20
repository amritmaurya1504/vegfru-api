const Razorpay = require("razorpay")

var receptNumber = 1

const createOrder = (req, res) => {
    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY,
        key_secret: process.env.RAZORPAY_SECRET
    })


    const { items, bill } = req.body
    // const amount = product.price * 100 * 70;
    // console.log(req.body);
    const currency = "INR";
    const amount = bill * 100;
    //receipt generated unique from database
    const receipt = `receipt#${receptNumber}`;
    receptNumber = receptNumber + 1;
    const notes = { name: "Vegfru Bill", desc: `${items} items` };

    instance.orders.create({ amount, currency, receipt, notes }, (error, order) => {
        if (error) {
            return res.status(500).json(error);
        }
        return res.status(200).json(order);
    })
}

module.exports = { createOrder }