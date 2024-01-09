const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
const nodemailer = require("nodemailer")
const MailGen = require("mailgen")
const Order = require("../../models/order/orderModel")
const { client } = require("../../redis/redisClient");
const asyncHandler = require("express-async-handler")
let endpointSecret;


const createCheckoutSession = asyncHandler(
    async (req, res, next) => {
        try {
            const { orderData } = req.body;
            console.log(orderData);
            const currentDate = new Date();
            const customer = await stripe.customers.create({
                metadata: {
                    user_id: req.user._id.toString(),
                    date: currentDate.getTime(),
                }
            })

            const lineItems = orderData.cartData.map((product) => ({
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: product.productName,
                        images: [product.productImage]
                    },
                    unit_amount: product.productPrice * 100,
                },
                quantity: product.quantity

            }))
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: lineItems,
                customer: customer.id,
                mode: "payment",
                success_url: `${process.env.CLIENT_URL}/route/success`,
                cancel_url: `${process.env.CLIENT_URL}/route/cancel`,
                shipping_options: [
                    {
                        shipping_rate_data: {
                            type: "fixed_amount",
                            fixed_amount: { amount: orderData.bill * 100, currency: 'inr' },
                            display_name: "Shipping Charge + Govt. Tax",
                        }
                    }
                ],
                consent_collection: {
                    terms_of_service: 'required',
                },
                custom_text: {
                    terms_of_service_acceptance: {
                        message: 'I agree to the [Terms of Service](https://example.com/terms)',
                    },
                },
            });

            // storing order data to temporary cache
            client.set(`orderData:userId:${req.user._id}:${currentDate.getTime()}`, JSON.stringify(orderData));
            client.expire(`orderData:userId:${req.user._id}:${currentDate.getTime()}`, process.env.DEFAULT_EXPIRATION_FOR_ORDER)
            res.json({ id: session.id });

        } catch (error) {
            console.log(error);
        }
    }
);

const paymentWebHook = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];

        let eventType;
        let data;

        if (endpointSecret) {
            let event;
            try {
                event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            } catch (err) {
                res.status(400).send(`Webhook Error: ${err.message}`);
                return;
            }

            data = event.data.object;
            eventType = event.type;
        } else {
            data = req.body.data.object;
            eventType = req.body.type;
        }


        if (eventType === "checkout.session.completed") {
            try {
                const customer = await stripe.customers.retrieve(data.customer);
                console.log(`orderData${customer.metadata.user_id}:${customer.metadata.date}`)
                const cachedData = await client.get(`orderData:userId:${customer.metadata.user_id}:${customer.metadata.date}`);
                if (cachedData) {
                    console.log("Inside cacheddata if condition")
                    paymentConfirmationMail(data, JSON.parse(cachedData));
                    saveToDB(JSON.parse(cachedData), data, customer);
                } else {
                    console.log("Cached data not found.");
                }
            } catch (error) {
                console.error("Error retrieving customer data:", error);
            }
        }
        // Return a 200 res to acknowledge receipt of the event
        res.send();
    } catch (error) {
        console.log(error);
    }

};

const paymentConfirmationMail = asyncHandler(async (intent, cachedData) => {
    try {

        let config = {
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            }
        }

        const transporter = nodemailer.createTransport(config);

        let MailGenerator = new MailGen({
            theme: "default",
            product: {
                name: "VegFru",
                "link": "vegfru.vercel.app",
                logo: 'https://res.cloudinary.com/amritrajmaurya/image/upload/v1696064957/logo_ez9ecr.png'
            }
        })

        const lineItems = cachedData.cartData.map((product) => ({
            item: product.productName,
            description: `${product.productPrice}/${product.productBaseUnit}${product.productUnit} (Quantity - ${product.quantity})`,
            price: `₹${product.actualPrice}`

        }))

        let response = {
            body: {
                name: intent.customer_details.name,
                intro: `Thank you for placing an order with us. Your Order/Payment details are as follows.`,
                table: {
                    data: lineItems
                },
                action: {
                    instructions: 'You can track the status of your order by clicking the button below:',
                    button: {
                        color: '#22c55e',
                        text: 'Track Your Order',
                        link: `${process.env.CLIENT_URL}`
                    }
                },
                outro: `Payment ID: <strong>${intent.payment_intent}</strong>, Total Bill: <strong>${cachedData?.billDetails?.totalBill}</strong>, OrderId : <strong>${intent.created}</strong>. If you have any questions or need further assistance, please contact our customer support.`
            }
        };

        let mail = MailGenerator.generate(response);

        let message = {
            from: process.env.EMAIL,
            to: intent.customer_details.email,
            subject: "Order Details | VegFru",
            html: mail
        }

        console.log(message);

        const info = await transporter.sendMail(message);
        console.log(info);

        console.log(info.messageId);
    } catch (error) {
        console.log(error)
    }
});

const saveToDB = asyncHandler(
    async (cachedData, intent, customer) => {
        try {
            const orderData = {
                itemsOrdered: cachedData?.cartData,
                storeId: cachedData?.storeData?._id,
                paymentDetails: {
                    orderId: intent.created,
                    intentId: intent.id,
                    created: intent.created,
                    paymentId: intent.payment_intent,
                    payment_method_types: 'card',
                    payment_status: intent.payment_status,
                },
                toAddress: cachedData?.shippingAddress?._id,
                orderDate: new Date(),
                billDetails: {
                    mrp: cachedData?.billDetails?.mrp,
                    tax: cachedData?.billDetails?.tax,
                    deliverFair: cachedData?.billDetails?.deliverFair,
                    totalBill: cachedData?.billDetails?.totalBill
                },
                vendorId: cachedData?.storeData?.vendorId,
            }
            const order = new Order({ ...orderData, customerId: customer.metadata.user_id, orderStatus: "Accepted" });
            await order.save();
        } catch (error) {
            throw new Error(error);
        }
    }
);

module.exports = { createCheckoutSession, paymentWebHook };