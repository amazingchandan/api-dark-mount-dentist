var mongoose= require ("mongoose");

const subscription =mongoose.Schema({
    plan_name:{
        type:String,
        require:true
    },
    type:{
        type: String,
        enum:["Yearly","Monthly"],
        require:true
    },
    status:{
        type: String,
        enum:["active", "inactive"],
        require:true,
        default:"active"
    },
    country:{
        type:String,
        default:null
    },
    description:{
        type:Array,
        default:null
    },
    minimum:{
        type:Number,
        default:null
    },
    maximum:{
        type: Number,
        default:null
    },
    paypalID:{
        type: String,
        default:null
    },
    amount:{
        type:Number,
        default:null
    },
    currency:{
        type:String,
        default:null
    },
    userCount: {
        type: Number,
        default: 0,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        default: undefined,
        ref:"User"
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        default: undefined,
        ref:"User"
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: undefined
    }
});

module.exports=mongoose.model("subscription",subscription);
