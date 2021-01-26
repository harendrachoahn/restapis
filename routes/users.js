var express = require('express');
var router = express.Router();
const controller = require('../controllers/users');
const User = require('../model/users');
const validateToken = require('../utils').validateToken;
const { check, validationResult } = require('express-validator');

// /* GET home page. */
router.get("/allusers",validateToken,controller.getAll);
router.get("/users",validateToken,controller.get);
router.post("/users", [
    check('name')
    .not()
    .isEmpty()
    .withMessage('Name is required'),
    check('email')
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid Email')
    .custom((value, {}) => {
      return new Promise((resolve, reject) => {
        User.findOne({email:req.body.email}, function(err, user){
          if(err) {
            reject(new Error('Server Error'))
          }
          if(Boolean(user)) {
            reject(new Error('E-mail already in use'))
          }
          resolve(true)
        });
      });
    }),
    check('phone')
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .custom((value, {req}) => {
      return new Promise((resolve, reject) => {
        User.findOne({phone:req.body.phone}, function(err, user){
          if(err) {
            reject(new Error('Server Error'))
          }
          if(Boolean(user)) {
            reject(new Error('Phone number already in use'))
          }
          resolve(true)
        });
      });
    })

  ],controller.add);

  //verify route
  router.post("/users/verify", [
    check('email')
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid Email')
    .custom((value, {req}) => {
      return new Promise((resolve, reject) => {
        User.findOne({email:req.body.email, verify:true}, function(err, user){
          if(err) {
            reject(new Error('Server Error'))
          }
          if(Boolean(user)) {
            reject(new Error('E-mail already verify'))
          }
          resolve(true)
        });
      });
    }),
    check('otp')
    .not()
    .isEmpty()
    .withMessage('OTP is required')
  ],controller.verify);
//login route
router.post("/login",[
  check('email')
  .not()
  .isEmpty()
  .withMessage('Email is required')
  .isEmail()
  .withMessage('Invalid Email'),
  check('password')
  .not()
  .isEmpty()
  .withMessage('Password is required')
],controller.login);
module.exports = router;

