"use strict";
const stripe = require("stripe")("sk_test_Hj77XwtdLyCvcnyAYqCvyvht");

/**
 *  order controller
 */
const { createCoreController } = require("@strapi/strapi").factories;
module.exports = createCoreController("api::order.order", ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;

        if (!user) {
            return ctx.unauthorized("You are not authorized!");
        }


        console.log(ctx.state.user.id);
        console.log("order controller");

        const { address, amount, items, token, city, state } =
            ctx.request.body.data;
        console.log(address, amount, items, token, city, state, "ctx");
        try {
            // Charge the customer
            const res = await stripe.charges.create({
                amount: amount * 100,
                currency: "inr",
                description: `Order ${new Date()} by ${ctx.state.user.id}`,
                source: token,
            });
            console.log(res, "res_stri[pe");

            // Create the order
            const order = res && await strapi.service("api::order.order").create({
                data: {
                    amount,
                    address,
                    items,
                    city,
                    state,
                    token,
                    user: ctx.state.user.id,
                    order_status: "INITIATED",
                    payment_id: res?.id,
                    stripe_response: res,
                    receipt_url: res?.receipt_url
                },
            });
            return order;
        } catch (err) {
            // return 500 error
            console.log("err", err);
            ctx.response.status = 500;
            return {
                error: { message: "There was a problem creating the charge" },
                address,
                amount,
                items,
                token,
                city,
                state,
            };
        }
    },
}));