import Order from "../models/order.js";
import Product from "../models/product.js";

export async function createOrder(req, res) {
    if (req.user == null) {
        return res.status(403).json({
            message: "Please login and try again"
        });
    }

    const orderInfo = req.body;
    if (orderInfo.name == null) {
        orderInfo.name = req.user.firstName + " " + req.user.lastName;
    }

    let orderId = "CBC00001";

    const lastOrder = await Order.find().sort({ date: -1 }).limit(1);
    if (lastOrder.length > 0) {
        const lastOrderId = lastOrder[0].orderId;
        const lastOrderNumber = parseInt(lastOrderId.replace("CBC", ""));
        const newOrderNumberString = String(lastOrderNumber + 1).padStart(5, '0');
        orderId = "CBC" + newOrderNumberString;
    }

    try {
        let total = 0;
        let labelledTotal = 0;
        const products = [];

        for (let i = 0; i < orderInfo.products.length; i++) {
            const item = await Product.findOne({ productId: orderInfo.products[i].productId });

            if (item == null) {
                return res.status(404).json({
                    message: "Product with productId " + orderInfo.products[i].productId + " not found"
                });
            }

            if (item.isAvailable == false) {
                return res.status(400).json({
                    message: "Product with productId " + orderInfo.products[i].productId + " is not available right now"
                });
            }

📌
            products[i] = {
                productInfo: {
                    productId: item.productId,
                    name: item.name,
                    altNames: item.altNames,
                    description: item.description,
                    images: item.images,
                    labelledPrice: item.labelledPrice,
                    price: item.price
                },
                quantity: orderInfo.products[i].qty
            }
            total += (item.price * orderInfo.products[i].qty)
            labelledTotal += (item.labelledPrice * orderInfo.products[i].qty)
        }

        const order = new Order({
            orderId: orderId,
            email: req.user.email,
            name: orderInfo.name,
            address: orderInfo.address,
            total: total,
            phone: orderInfo.phone,
            products: products,
            labelledTotal : labelledTotal,
            total : total
        });

        const createdOrder = await order.save();
        res.json({
            message: "Order created successfully",
            order: createdOrder
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to create order",
            error: err.message
        });
    }
}
