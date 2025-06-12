import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
// import db from '../config/db_config';

const app = express();
app.use(express.json());

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;
        
        if(!emailOrUsername || !password ){
            return res.json({message:'All fields are required'})
        }

        const user = await User.findOne({ 
            where: {
                email: emailOrUsername
            }
        });

        if(!user){
            return res.status(401).json({message:'Incorrect password or email' }) 
        }

        if (password !== user.password) {
            return res.status(401).json({message:'Incorrect password or email' }) 
        }

        const token = jwt.sign({ id: user.UID }, process.env.JWT_SECRET || "!MalinoNationalHighSchool", { expiresIn: '1h' });
        console.log(user.name);
        
        res.header('Authorization', `Bearer ${token}`).json({
            token,
            username: user.email,
            userID: user.lrn,
            userRole: user.user_role,
            strand: user.strand,
            id: user.UID,
            name: user.name
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
