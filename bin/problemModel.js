// models/problemModel.js
import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    difficulty: { type: String, required: true },
    link: { type: String, required: true },
});

export default mongoose.model('Problem', problemSchema);
