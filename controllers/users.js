const User = require('../model/users');
const Otp = require('../model/otp');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var Mail = require('../helper/mail');
var mongoose = require('mongoose');
var moment = require('moment');
const { check, validationResult } = require('express-validator');
client = require('twilio')(process.env.account_sid, process.env.auth_token)


module.exports = {
  add: (req, res) => { 
    const validationErrors = validationResult(req);
    let errors = [];
    if(!validationErrors.isEmpty()) {
      Object.keys(validationErrors.mapped()).forEach(field => {
        errors.push(validationErrors.mapped()[field]['msg']);
      });
    }
    let result = {};
    let status = 201;
    if(errors.length){
      status = 400;
      result.status = status;
      result.error = errors;
      res.status(status).send(result);
    }  else {
          const { email,name, password,phone } = req.body;
          const user = new User({ email,name, password,phone }); 
          user.save((err, user) => {
            if (!err) {
             
              var code = Math.floor((Math.random()*999999)+111111);
              // Create a verification token for this user
              var otp = new Otp({ _userId: user._id, otp: code });
              // Save the verification otp
              otp.save(function (err, otp) {
                  if (err) { 
                      console.log(err.message)  
                      }
                  // Send the email
                  var to = req.body.email;
                  var subject = "Account Verification.";
                  var content = '<br>Hello ' + req.body.name + ',<br>' + ' Please verify your account by this OTP :' + otp.otp;
                  Mail.sendMail(to, subject, content);
                  //send Message 
                client.messages
                    .create({
                      body: 'Please verify your account by this OTP :' + otp.otp,
                      from: process.env.twilio_number,
                      to: req.body.phone,
                    })
                    .then(message => console.log(message.sid));
              });
              result.status = status;
              result.result = user;
            } else {
              status = 500;
              result.status = status;
              result.error = err.message;
            }
            res.status(status).send(result);           
          });
    }    
  },
  //verify users method
  verify: (req, res) => { 
    const validationErrors = validationResult(req);
    let errors = [];
    if(!validationErrors.isEmpty()) {
      Object.keys(validationErrors.mapped()).forEach(field => {
        errors.push(validationErrors.mapped()[field]['msg']);
      });
    }
    let result = {};
    let status = 400;
    if(errors.length){
      result.status = status;
      result.error = errors;
      res.status(status).send(result);
    }else{
      const { email } = req.body;
      User.findOne({email}, (err, user) => {
        if (!err && user) {          
          let query = {_userId:mongoose.Types.ObjectId(user._id),otp:req.body.otp};
          Otp.findOne(query,(err,otp)=>{
            if (!err && otp) {
               //check this expiry
               let otp_expiry = otp["createdAt"];
               console.log(otp_expiry);
               otp_expiry = moment(otp_expiry).format('YYYY-MM-DD h:mm:ss A');                
               otp_expiry = moment(otp_expiry).add(30, 'minutes').format('YYYY-MM-DD h:mm:ss A');
               var today = moment(new Date()).format('YYYY-MM-DD h:mm:ss A');

               if (moment(today).isAfter(otp_expiry)) {
                  status = 400;     
                  result.status = status;
                  result.error = "This OTP has been expired";
                  return res.status(status).send(result);
               }else{
                // If we found a otp, find a matching user
                  if (user.verify){ 
                    result.error = 'This user has already been verified';
                    return res.status(status).send(result);
                  }
                  else{
                      // Verify and save the user
                      user.verify = true;
                      user.save(function (err) {
                          if (err) { 
                            status = 500;     
                            result.status = status;
                            result.error = err.message;
                            return res.status(status).send(result); 
                          }else{
                            status = 200;     
                            result.status = status;
                            result.error = "Your account successfully verify.";
                            return res.status(status).send(result);
                          } 
                          
                      });
                  }                  
               }              
            }else{
              status = 400;
              result.status = status;
              result.error = "OTP not found.";
              return res.status(status).send(result);
            }

          });      
        } else {
          status = 404;
          result.status = status;
          result.error = err;
          return res.status(status).send(result);
        }
      }); 
    }    
  },
  //login method
  login: (req, res) => {
    const validationErrors = validationResult(req);
    let errors = [];
    if(!validationErrors.isEmpty()) {
      Object.keys(validationErrors.mapped()).forEach(field => {
        errors.push(validationErrors.mapped()[field]['msg']);
      });
    }
    let result = {};
    let status = 201;
    if(errors.length){
      status = 400;
      result.status = status;
      result.error = errors;
      res.status(status).send(result);
    }else{
    const { email, password } = req.body;
      let result = {};
      let status = 200;
        User.findOne({email}, (err, user) => {
          if (!err && user) {
            // We could compare passwords in our model instead of below
            bcrypt.compare(password, user.password).then(match => {
              if (match) {
                status = 200;
                // Create a token
                const payload = { userId: user._id, name: user.name };
                const options = { expiresIn: '2d', issuer: 'https://scotch.io' };
                const secret = process.env.JWT_SECRET;
                const token = jwt.sign(payload, secret, options);

                // console.log('TOKEN', token);
                result.token = token;
                result.status = status;
                result.result = user;
              } else {
                status = 400;
                result.status = status;
                result.error = 'Authentication error';
              }
              res.status(status).send(result);
            }).catch(err => {
              status = 500;
              result.status = status;
              result.error = err;
              res.status(status).send(result);
            });
          } else {
            status = 400;
            result.status = status;
            result.error = 'Invaild email.';
            res.status(status).send(result);
          }
        }); 
    }   
  },
  //Get All users 
  getAll: (req, res) => {
    const payload = req.decoded;
    if (payload && payload.user === 'admin') {
      User.find({}, (err, users) => {
        if (!err) {
          
          res.send(users);
        } else {
          console.log('Error', err);
        }
      });
    } else {
      status = 401;
      result.status = status;
      result.error = `Authentication error`;
      res.status(status).send(result);
    }
  },
  //get login users details
  get: (req, res) => {
    let result={};
    const payload = req.decoded;
    console.log(payload);
    if (payload && payload.userId) {
      User.findById(payload.userId, (err, users) => {
        if (!err) { 
          status = 200;
          result.status = status;
          result.result = users;
          res.status(status).send(result); 
        } else {
          console.log('Error', err);
        }
      });
    } else {
      status = 401;
      result.status = status;
      result.error = `Authentication error`;
      res.status(status).send(result);
    }
  }
  
}