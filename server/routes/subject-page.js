import express from 'express';
import Module from '../models/Module.js';
import path from 'path';

const app = express();
app.use(express.json());

const router = express.Router();

router.get('/', async (req, res) => { 
    const { subject } = req.query;
    try {
        const modules = await Module.findAll({ where: { 'subject' : subject } });
        res.status(200).json({ modules });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch module' });
    }
});

router.put('/progress/:id', async (req, res) => {
    const { id } = req.params;
    const { progress } = req.body; 
    
    try {
        const module = await Module.update({ progress }, { where: { MID: id } });
            
        if (module[0] === 0) {
            return res.status(404).json({ message: 'Module not found' });
        }

        res.status(200).json({ message: 'Progress updated successfully' });
    } catch (err) {
        console.error('Error updating progress:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
    
//     try {
//         const user = await User.findOne({ where: { 'UID' : id } });
//         const { grlvl, strand, name, user_role } = user;
//         let modules;

//         if (user_role === "IRREG"){
//             modules = await Module.findAll({ where: { strand }}); 
//         } else {
//             modules = await Module.findAll({       
//                 where: { 
//                     strand, 
//                     grlvl 
//                 } 
//             });
//         }
//         res.status(200).json({ name, modules });
//     } catch (err) {
//         res.status(500).json({ message: 'Failed to fetch modules' });
//     }
// })