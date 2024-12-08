import mongoose from "mongoose";
const Schema = mongoose.Schema;

const LeetCodeSchema = new Schema({
  user_id: { type: String, required: true },
  total_solved: { type: Number, default: 0 },
  easy: { type: Number, default: 0 },
  medium: { type: Number, default: 0 },
  hard: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  badge: { type: String, default: 'No Badge' },
  question_solved: [{ type: Schema.Types.ObjectId, ref: 'LeetCodeQuestion' },],
  modifiedAt:{type: Date}
});

export default  mongoose.model('LeetCode', LeetCodeSchema);
