const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
require('dotenv').config()


mongoose.connect('mongodb://localhost:27017/node-rest-shop', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Mongo Connected');
    }
})

app.use(morgan('dev')) // bu galgan requestloni log atib durodi
app.use(cors())
app.use('/uploads', express.static('uploads'))
// to parse body request
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


// Routes which should handle requests
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);

// handling error when come request with no route of it
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})


app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        }
    })
})
module.exports = app;