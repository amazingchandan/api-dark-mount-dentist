<<<<<<< HEAD
var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = mongoose.Schema({
    first_name: {
        type: String,
        trim: true,
        required: true
    },
    last_name: {
        type: String,
        trim: true,
        required: true
    },
    contact_number: {
        type: Number,
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
        enum: ["admin", "dentist"],
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
    subscription_details: {
        subscription_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: undefined
        },
        start_date: {
            type: Date,
            default: null
        },
        end_date: {
            type: Date,
            default: null
        },
        status: {
            type: Boolean,
        },

    },

    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: undefined
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: undefined
    }
});

User.methods.generateHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
}

User.methods.validatePassword = function (password) {
    const result = bcrypt.compareSync(password, this.password);
    return result; 
}

=======
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

>>>>>>> 35b65c980f9c05d935a701571b31fb9b2a2f9fbd
module.exports = mongoose.model('User', User);