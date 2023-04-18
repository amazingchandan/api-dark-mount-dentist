var mongoose = require("mongoose");

const evaluation = mongoose.Schema({
  xray_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "xray",

  },
  ai_identified_cavities: {
      
      rectangle_coordinates:[{
        coordinates: []
      }],
      color_labels:[Number],
      model_version:String,
      accuracy_score:[Number],
  },
  dentist_correction: {
    type: [{
      id: String,
      original_height:Number,
      original_width:Number,
      value: {
        height: Number,
        width: Number,
        rectanglelabels: Array,
        x: Number,
        y: Number,
       
      },

    }],

  },
  admin_correction: {
    type: [{
      id: String,
      original_height:Number,
      original_width:Number,
      value: {
        height: Number,
        width: Number,
        rectanglelabels: Array,
        x: Number,
        y: Number,
      },

    }],

  },
 
  accurate_val: {
    type: Number,
    default:null
  },
  evaluated_by: {
    type: mongoose.Schema.Types.ObjectId,
    default: undefined,
    ref: "User"
  },
  evaluated_on: {
    type: Date,

  },
  evaluation_status:{
    type: Boolean,
    default:false,
  },
  flag :{
    type: Number,
    enum: [0,1],
     default: 0 
 }
})

module.exports = mongoose.model("evaluation", evaluation);


