import mongoose from "mongoose";
const Schema = mongoose.Schema;

const GFGQuestionSchema = new Schema({
  title: { type: String, required: true,index:true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  link: { type: String, required: true },
  tags :[{type:String}],
  id:{type: String},

  
});

export default  mongoose.model('GFGQuestion', GFGQuestionSchema);
