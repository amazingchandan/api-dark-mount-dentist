var mongoose = require("mongoose");

const evaluation = mongoose.Schema({
  xray_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "xray",

  },
  ai_identified_cavities: {
      
      rectangle_coordinates:[],
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
  dentist_correction_percentage: {
    type: Number,
    default: null
  },
  admin_correction_percentage: {
    type: Number
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
  }
})

module.exports = mongoose.model("evaluation", evaluation);


