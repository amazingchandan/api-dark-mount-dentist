var mongoose= require("mongoose");

const xray= mongoose.Schema({
    xray_image:{
        path:{
            type:String,
        },
        mimetype:{
            type:String,
        }
    },
    isActive:{
        type:Boolean,
        default:true
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:undefined
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: null
    },
    evaluation_status:{
        type: Boolean,
        default:false,
      }
});



    
module.exports=mongoose.model("xray",xray);