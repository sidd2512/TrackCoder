import mongoose from "mongoose";
const Schema = mongoose.Schema;

const LeetCodeQuestionSchema = new Schema({
  title: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  link: { type: String, required: true },
  id: { type: String, required: true }
});

export default  mongoose.model('LeetCodeQuestion', LeetCodeQuestionSchema);
