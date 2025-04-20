import mongoose from "mongoose";

const rantSchema = new mongoose.Schema({

  name:{
    type: String,
    required: true
  },

  rant:{
    type: String,
    required: true
  },

  date:{
    type: String,
    required: true
  },

  time:{
    type: String,
    required: true
  }


}, {timestamps: true});

const Rant = mongoose.model('Rants', rantSchema);
export default Rant;