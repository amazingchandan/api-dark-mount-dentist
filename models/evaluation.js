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
    dentist_correction:[{
      type: [{
        x:Number,
        y:Number
      }],
    
    }],
    admin_correction:[
        {
            type:Array,
            default:[]
        }
    ],
    dentist_correction_percentage:{
        type:Number,
        default:null
    },
    admin_correction_percentage:{
        type:Number
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