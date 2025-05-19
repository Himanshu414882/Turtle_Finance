// models/SubscriptionPlan.js
const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
  planName: {
    type: String,
    enum: ['Indian', 'NRI'],
    required: true,
    unique: true,
  },
  priceRupees: {
    type: Number,
    required: true,
    min: 0,
  },
  priceDollar: {
    type: Number,
   // required: true,
    min: 0,
  },
  
},
 { timestamps: true });


module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);