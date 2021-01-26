const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const environment = process.env.NODE_ENV;
const stage = require('../config/config')[environment];

// schema maps to a collection
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: 'String',
    required: true,
    trim: true,
    lowercase: true,
    index: {unique : true}
  },
  name: {
    type: 'String',
    required: true,
    trim: true,
  },
  password: {
    type: 'String',
    required: true,
    trim: true
  },
  phone: {
    type: 'String',
    required: true,
    trim: true,
  },
  verify: {
    type: Boolean,
    default: false
  }  
},{timestamps: true});

// encrypt password before save
userSchema.pre('save', function(next) {
    const user = this;
    if(!user.isModified || !user.isNew) { // don't rehash if it's an old user
      next();
    } else {
      bcrypt.hash(user.password, stage.saltingRounds, function(err, hash) {
        if (err) {
          console.log('Error hashing password for user', user.name);
          next(err);
        } else {
          user.password = hash;
          next();
        }
      });
    }
  });

module.exports = mongoose.model('User', userSchema);