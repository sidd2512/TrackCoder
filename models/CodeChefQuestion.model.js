import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CodeChefQuestionSchema = new Schema({
  title: { type: String, required: true },
  time:{type:String },
  link: { type: String, required: true },
  
});

export default  mongoose.model('CodeChefQuestion', CodeChefQuestionSchema);
