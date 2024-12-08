// // server.js


import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db/cofig.db.js';
import cookieParser from 'cookie-parser';



// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend origin
    credentials: true, // Allow cookies
  })
);

app.use(express.json());

// Routes
import authRouter from './routes/auth.routes.js'
import friendRoutes from './routes/friend.routes.js';
import userRouter from './routes/user.routes.js';

app.use('/api/auth', authRouter);
app.use('/api/friend', friendRoutes);
app.use('/api/user', userRouter);

// Start the server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));




































// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB connection
// mongoose.connect('mongodb://localhost:27017/trackcoder', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
// .then(() => console.log("Connected to MongoDB"))
// .catch(error => console.error("Could not connect to MongoDB:", error));

// // Define your routes here (you'll create these in the next steps)
// //import userRoutes from './routes/userRoutes.js';
// // import problemRoutes from './routes/problemRoutes.js';
// //app.use('/api/users', userRoutes);
// // app.use('/api/problems', problemRoutes);

// import authRouter from './routes/register.routes.js'
// import friendRoutes from './routes/addfriend.routes.js';
// import userRouter from './routes/user.routes.js'

// app.use('/api/', authRouter);
// app.use('/api/addFriend', friendRoutes);
// app.use('/api/user',userRouter);


// // Start the server
// app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
