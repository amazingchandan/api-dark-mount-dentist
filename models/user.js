var mongoose = require("mongoose");

const User = mongoose.Schema({
    first_name :{
        type: String,
        trim: true,
        required: true
    },
    last_name :{
        type: String,
        trim: true,
        required: true
    },
    contact_number :{
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
   address1: {
        type: String,
        default: null
    },
    address2: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum : ["admin","dentist"],
        default: "dentist" // 1 for admin 0 for Superadmin
    },
    
    city: {
        type: String,
        trim: true,
    },
    state: {
        type: String,
        trim: true,
    },
    country: {
        type: String,
        trim: true,
    },
   pincode: {
        type: Number,
        trim: true,
    },
    subscription_details :{
     subscription_id:{
           type: mongoose.Schema.Types.ObjectId,
           ref:"User",
           default:undefined
        },
     start_date:{
        type:Date,
        default:null
     },
     end_date:{
        type: Date,
        default:null
     },
     status:{
        type:Boolean,
     },
     
    },
    isActive:{
         type:Boolean,
         default:true
    },
  
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: undefined
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default:undefined
    }
});

module.exports = mongoose.model('User', User);