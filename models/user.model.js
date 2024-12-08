import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true ,index:true},
    user_id:{ type: String, required: true, unique: true,index:true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    leetcode_id: { type: Schema.Types.ObjectId, ref: 'LeetCode' },
    gfg_id: { type: Schema.Types.ObjectId, ref: 'GFG' },
    codechef_id: { type: Schema.Types.ObjectId, ref: 'CodeChef' },
    friends: [
        {
            name: { type: String , index:true },
            leetcode_id: { type: Schema.Types.ObjectId, ref: 'LeetCode' },
            gfg_id: { type: Schema.Types.ObjectId, ref: 'GFG' },
            codechef_id: { type: Schema.Types.ObjectId, ref: 'CodeChef' }
        }
    ],
    refreshToken: {
        type: String
    }
});

// Generate Access Token
UserSchema.methods.generateAccessToken = function () {
    return jwt.sign({ _id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1d', // Adjust as needed
    });
  };
  
  // Generate Refresh Token
  UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '20d', // Adjust as needed
    });
  };

export default  mongoose.model('User', UserSchema);
