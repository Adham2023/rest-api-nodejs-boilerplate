const express = require('express')
const router = express.Router();
const mongoose = require('mongoose')
const Order = require('../models/Order');
const checkAuth = require('../middleware/check-auth');
const getAllOrders = require('../controllers/orders');


router.get('/',checkAuth,  getAllOrders.orders_get_all)

router.post('/', checkAuth,  (req, res, next) => {
    const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId
    })
    order.save().then(result => {
        res.status(201).json({
            result
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

router.get('/:orderId',checkAuth, (req, res, next) => {
    Order.findById(req.params.orderId).exec()
        .then(order => {
            res.status(200).json({
                order
            })
        }).catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.delete('/:orderId',checkAuth,  (req, res, next) => {
    Order.deleteOne({ _id: req.params.orderId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Order deleted',
                result
            })
        }).catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router