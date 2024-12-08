import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;

export const verifyToken = (req, res, next) => {
  const token =  req.cookies?.accessToken ||  req.headers.cookie?.split('=')[1] || req.headers.authorization?.split(' ')[1];
    
  console.log(token);
  
  if (!token) {
    console.log('token not available');
    
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  //console.log(token);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user data to the request
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
