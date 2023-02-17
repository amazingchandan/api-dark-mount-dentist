var mongoose = require("mongoose");

const evaluation=mongoose.Schema({
    xray_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"xray",
        
    },
    ai_identified_cavities:{
        type:Number,
        default:null
    },
    dentist_correction:{
        type:Number,
        default:null
    },
    dentist_correction_percentage:{
        type:Number,
        default:null
    },
    evaluated_by: {
        type: mongoose.Schema.Types.ObjectId,
        default: undefined,
        ref:"User"
    },
    evaluated_on: {
        type: Date,
    
    },
})

module.exports=mongoose.model("evaluation",evaluation);