const express = require('express')
const router = express.Router();
const mongoose = require('mongoose')
const User = require('../models/user.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function checkUserExistence(email) {
    console.log('Searching user', email)
    return new Promise((resolve, reject) => {
        User.findOne({ email }).then(user => {
            console.log('this is a user: ', user);
            if (user) {
                console.log('User exists')
                resolve(true);
            } else {
                console.log('User not exists')
                resolve(false)
            }
        }).catch(err => {
            console.log("Error search email", err)
            reject(false)
        })
    })
}

// function getAllUsers() {
//     return new Promise((resolve, reject) => {
//         User.find().select('_id').then(docs => {
//             console.log('All ids: ', docs);
//             resolve(docs);
//         }).catch(err => {
//             reject(err)
//         })
//     }) 
// }

// function deleteOne(id) {
//     return new Promise((resolve, reject) => {
//         User.deleteOne({_id: id}).then(user => {
//             resolve();
//         }).catch(err => {
//             reject(err)
//         })
//     })
// }

// function deleteOneByOne(arr_ids) {
//     if(arr_ids.length > 0) {
//         deleteOne(arr_ids[arr_ids.length - 1].id).then( () => {
//         arr_ids.splice(-1,1);
//         deleteOneByOne(arr_ids)
//         }).catch(err =>  {
//             return
//         })
//     } else {
//         return
//     }
// }

// router.get('/allUsers', (req, res, next) => {
//     getAllUsers().then(docs => {
//         if(docs.length > 0) {
//             deleteOneByOne(docs)
//             res.status(201).json({
//                 message: 'All deleted'
//             })
//         } else {
//             res.status(201).json({
//                 message: 'users doc is empty'
//             })
//         }

//     }).catch(err => {
//         res.status(503).json({
//             error: err
//         })
//     })
// })

router.post('/signup', async (req, res, next) => {
    let exists = await checkUserExistence(req.body.email)
    if (!exists) {
        bcrypt.hash(req.body.password, 12, (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: err
                })
            } else {
                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    email: req.body.email,
                    password: result
                });
                user.save().then(usr => {
                    res.status(201).json({
                        user: usr,
                        message: "User created"
                    })
                }).catch(err => {
                    res.status(500).json({
                        error: err
                    })
                })
            }
        })
    } else {
        res.status(403).json({
            message: 'User exists'
        })
    }
})



function signJWT(param) {
    return jwt.sign({   email: param.email,
                        userId: param.userId
                    },
                    process.env.JWT_SECRET_KEY, {
                        expiresIn: '1h'
                    })
}



router.post('/login', (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user === null) {
                res.status(401).json({
                    message: 'Auth failed'
                })
            }
            bcrypt.compare(req.body.password, user.password, (err, valid) => {

                if (!valid || err) {
                    res.status(401).json({
                        message: 'Auth failed'
                    })
                } else {
                    let token = signJWT({email: user.email, userId: user._id});
                    res.status(200).json({
                        message: 'Auth successful',
                        token
                    })
                }
            })
        })
        .catch(err => {
            res.status(403).json({
                error: err
            })
        })
})

module.exports = router;