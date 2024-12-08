import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CodeChefSchema = new Schema({
  user_id: { type: String, required: true },
  total_solved: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  badge: { type: String, default: 'No Badge' },
  question_solved: [{ type: Schema.Types.ObjectId, ref: 'CodeChefQuestion' }],
  modifiedAt:{type: Date}
});

export default mongoose.model('CodeChef', CodeChefSchema);
