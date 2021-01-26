var mongoose = require('mongoose');
var OtpSchema = new mongoose.Schema({
    _userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
      trim: true, 
      ref: 'Users' 
    },
    otp: { 
      type: String, 
      required: true , 
      index: {unique : true}
    },
    createdAt: { 
      type: Date, 
      required: true, 
      default: Date.now
    },
  });


module.exports = mongoose.model('Otp', OtpSchema);