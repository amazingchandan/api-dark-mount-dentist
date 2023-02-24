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
    country:{
        type:String,
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
    amount:{
        type:Number,
        default:null
    },
    currency:{
        type:String,
        default:null
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
