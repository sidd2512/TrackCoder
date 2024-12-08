import mongoose from "mongoose";
const Schema = mongoose.Schema;

const GFGSchema = new Schema({
  user_id: { type: String, required: true },
  total_solved: { type: Number, default: 0 },
  easy: { type: Number, default: 0 },
  medium: { type: Number, default: 0 },
  hard: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  question_solved: [{ type: Schema.Types.ObjectId, ref: 'GFGQuestion' }],
  modifiedAt:{type: Date}
});

export default  mongoose.model('GFG', GFGSchema);
