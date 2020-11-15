const express = require('express')
const router = express.Router();
const Product = require('../models/product.js');
const mongoose = require('mongoose')
router.get('/', (req, res, next) => {
    Product.find().exec().then(docs => {
        console.log(docs)
        if(docs.length > 0)
            res.status(200).json(docs);
            else  res.status(200).json({
                resourceLenght: 0,
                message: 'No Products'
            });

    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err.message
        })
    })

})
router.post('/', (req, res, next) => {
    console.log('product')
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    })

    product.save().then(result => {
        console.log(result)
        res.status(201).json({
            message: 'Product posted',
            createProduct: result
        })
    }).catch(err => {
        console.log(err);
        next()
    })

})
router.get('/:productId', (req, res, next) => {

    Product.findById(req.params.productId)
        .exec()
        .then(doc => {
            console.log(doc);
            if (doc) {
                res.status(200).json({
                    product: doc
                })
            } else {
                res.status(404).json({
                    message: 'Product could not found'
                })
            }
        }).catch(err => {
            console.log(err)
            res.status(500).json({ error: err });
        })

})
router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId

    const updateOps = {};

    for(const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }

    Product.update({ _id: id}, {
        $set: updateOps
    }).exec()
    .then(result => {
        res.status(200).json({
            message: 'Updated product',
            result
        })
    } ).catch(err => {
        res.status(500).json({
            error: err
        })
    })

    
})
router.delete('/:pdocutId', (req, res, next) => {
    let id = req.params.pdocutId
    Product.deleteOne({ _id: id }).exec().then(result => {
        res.status(200).json({
            message: result
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })

})

module.exports = router