import mongoose from "mongoose";
const Schema = mongoose.Schema;

const LeetCodeQuestionSchema = new Schema({
  title: { type: String, required: true,index:true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard']},
  link: { type: String, required: true },
  id: { type: String },
  
});

export default  mongoose.model('LeetCodeQuestion', LeetCodeQuestionSchema);
