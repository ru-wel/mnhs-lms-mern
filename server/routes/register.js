import express from 'express';
import User from '../models/User.js';

const app = express();
app.use(express.json());

const router = express.Router();

router.get('/', (req, res) => { 
    res.send("HELLO") // REMOVE
})

router.post('/', async (req, res) => {

    const { name, email, lrn, grlvl, strand, password } = req.body;
    const user_role = "STUDENT";

    console.log({ 
        name: name,
        email: email, 
        lrn: lrn, 
        grlvl: grlvl, 
        strand: strand, 
        password: password, 
        user_role: user_role 
    }); // REMOVE

    try {
        await User.create({
            name: name, 
            email: email, 
            lrn: lrn, 
            grlvl: grlvl, 
            strand: strand, 
            password: password, 
            user_role: user_role 
        });
        res.status(201).json({ message: 'User has been registered successfully!' });
    } 
    catch (error) {
        console.error("Error registering user:", error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ message: 'Email or LRN already exists!' });
        } 
        else if (error.name === 'SequelizeValidationError') {
            res.status(400).json({ message: 'Validation error: Check your inputs.' });
        } 
        else {
            res.status(500).json({ message: 'Internal server error. Please try again later.' });
        }
    }
});

export default router;