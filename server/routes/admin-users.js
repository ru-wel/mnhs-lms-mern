import express from 'express';
import User from '../models/User.js';

const app = express();
app.use(express.json());

const router = express.Router();

// get all users
router.get('/', async (req, res) => { 
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

// edit user
router.put('/edit/:id', async (req, res, next) => {
    const { id } = req.params;
    const { name, lrn, email, grlvl, strand, user_role, password } = req.body;
    
    try {
        const user = await User.findOne({ where: { 'UID' : id } });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        await User.update(
          { name, lrn, email, grlvl, strand, user_role, password }, { where: { 'UID' : id } }
        );
    
        const updateUser = await User.findOne({ where: { 'UID' : id } });
        res.status(200).json({ message: 'User updated successfully!', updateUser });
      } catch (error) {
        console.error('Error updating user:', error);
        next(error);
      }
});

// delete user
router.delete('/delete/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ where: { "UID" : id } });

        if (!user) return res.status(404).json({ message: 'User not found!'});

        await User.destroy({ where: { "UID" : id } });
        res.status(200).json({ message: 'User successfully deleted!' });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

// add admin
router.post('/add', async (req, res, next) => {
  console.log(req.body);
  const { name, email, password, grlvl, strand, } = req.body;
  const lrn = "0";
  const user_role = "ADMIN";

  try {
    const newAdmin = await User.create({
        name: name, 
        email: email, 
        lrn: lrn, 
        grlvl: grlvl, 
        strand: strand, 
        password: password, 
        user_role: user_role 
    });
    res.status(201).json({ message: 'User has been registered successfully!', newAdmin });
    } catch (error) {
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

})

export default router;