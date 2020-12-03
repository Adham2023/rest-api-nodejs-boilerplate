const Order = require('../models/Order');


exports.orders_get_all = (req, res, next) => {
    Order.find()
        .select('_id product quantity')
        .exec()
        .then(docs => {
            res.status(200).json({
                orders: docs
            })
        }).catch(err => {
            res.status(500).json({
                error: err
            })
        })
}