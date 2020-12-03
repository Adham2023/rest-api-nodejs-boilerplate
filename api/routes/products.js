const express = require('express')
const router = express.Router();
const Product = require('../models/product.js');
const mongoose = require('mongoose')
const multer = require('multer')
const checkAuth = require('../middleware/check-auth');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + file.originalname)
    }
})


const fileFilter = (req, file, cb) => {
    console.log(file.mimetype, file.mimetype.includes('image'))
    if (file.mimetype.includes('image'))
        cb(null, true) // 
    else cb(new Error(`{
        message: 'file wrong type',
        status: 4004
    }`), false) // to reject

}

const upload = multer({ storage, limits: { fileSize: 1024 * 1024 * 5 } , fileFilter});


router.get('/', checkAuth,  (req, res, next) => {
    Product.find().select('name price _id productImage').exec().then(docs => {
        console.log(docs)
        if (docs.length > 0)
            res.status(200).json(docs);
        else res.status(200).json({
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
router.post('/',checkAuth,  upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
    console.log('product')
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
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
router.get('/:productId',checkAuth , (req, res, next) => {

    Product.findById(req.params.productId)
        .select('name price _id productImage')
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
router.patch('/:productId', checkAuth,  (req, res, next) => {
    const id = req.params.productId

    const updateOps = {};

    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }

    Product.update({ _id: id }, {
        $set: updateOps
    }).then(result => {
            res.status(200).json({
                message: 'Updated product',
                result
            })
        }).catch(err => {
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



var fs = require("fs");
var request = require("request");

var options = { method: 'POST',
  url: 'https://{s3-bucket-url}}.amazonaws.com',
  headers: {'content-type': 'multipart/form-data' },
  formData:
   { policy: '{{policy}}',
     key: '{{key}}',
     'x-amz-signature': '{{x-amz-signature}}',
     'x-amz-algorithm': '{{x-amz-algorith}}',
     'x-amz-date': '{{x-amz-date}}',
     'x-amz-credential': '{{x-amz-credential}}',
     success_action_status: '201',
     success_action_redirect: '',
     file:
      { value: fs.createReadStream('/fileDir/fileName.mp4'),
        options:
         { filename: '/fileDir/fileName.mp4',
           contentType: null,
         }
      }
   }
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);
  console.log(body);
});