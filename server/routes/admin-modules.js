import express from 'express';
import Module from '../models/Module.js';

// file upload imports
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// file uploads config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    },
});
  
const upload = multer({ storage });
const app = express();
app.use(express.json());
const router = express.Router();

// get all modules
router.get('/', async (req, res) => { 
    try {
        const modules = await Module.findAll();
        res.status(200).json(modules);
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

// upload module
router.post('/', upload.single('file'), async (req, res) => {
    try {
        const { grlvl, strand, type, title, subject, uploader, url } = req.body;

        const lowerCaseSubject = subject.toLowerCase();
        const file = req.file;
        let newModule;

        if (file) {
            const fileData = fs.readFileSync(file.path);
            console.log('Uploaded file path:', req.file.path);

            newModule = await Module.create({
                grlvl,
                strand,
                type,
                subject: lowerCaseSubject,
                title,
                file_name: file.originalname,
                file_data: fileData,
                uploader,
            });

        } else if (url) {
            newModule = await Module.create({
                grlvl,
                strand,
                type,
                subject: lowerCaseSubject,
                title,
                file_name: url,    
                file_data: "",
                uploader,
            });

        } else {
            return res.status(400).json({ message: 'No file or URL provided' });
        }

        res.status(201).json({ message: 'Module has been uploaded successfully!', newModule });
    } catch (error) {
        console.error('Error uploading module:', error);
        res.status(500).json({ message: 'Error uploading module, please try again later.' });
    }
});

// download module
router.get('/download/:id', async (req, res) => { 
    try {
        const module = await Module.findByPk(req.params.id);
    
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        const filePath = path.join('uploads', module.file_name);
        const fileName = module.file_name;

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${module.file_name}"`);
        res.download(filePath, fileName, (err) => {
            if (err) {
                res.status(500).send({ message: 'Error downloading the file', error: err });
            }
        });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error retrieving the file', error: err.message });
        }
});

router.put('/edit/:id', upload.single('file'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { grlvl, strand, type, title, subject, file_name } = req.body;
        const file = req.file;

        const lowerCaseSubject = subject.toLowerCase();

        console.log('ID:', id);
        console.log('Gr Lvl:', grlvl);
        console.log('Strand:', strand);
        console.log('Type:', type);
        console.log('Title:', title);
        console.log('Subject:', lowerCaseSubject);
        console.log('File/URL:', file_name);

        const updateData = { grlvl, strand, type, title, subject:lowerCaseSubject };
        
        if (file) {
            const module = await Module.findOne({ where: { MID: id } });
            if (module && module.file_name) {
                const oldFile = path.join('uploads', module.file_name);
                if (fs.existsSync(oldFile)) {
                    fs.unlinkSync(oldFile);
                    console.log(`Deleted old file: ${module.file_name}`);
                }
            }
            updateData.file_name = file.filename;
            updateData.file_data = fs.readFileSync(file.path);
        } else if (file_name) {
            updateData.file_name = file_name;
            updateData.file_data = "";
        }

        const [updatedRow] = await Module.update(updateData, { where: { 'MID': id } });

        if (!updatedRow) {
            return res.status(404).json({ message: 'Module not found' });
        }

        const updatedModule = await Module.findOne({ where: { 'MID': id } });
        res.status(200).json({ message: 'Module successfully updated!', updatedModule });
    } catch (error) {
        console.error('Error updating module:', error);
        next(error);
    }
});

// delete module
router.delete('/delete/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const module = await Module.findOne({ where: { "MID" : id } });

        if (!module) return res.status(404).json({ message: 'Module not found!'});

        const filePath = path.join('uploads', module.file_name);
        if (fs.existsSync(filePath)){
            fs.unlinkSync(filePath);
        }

        await Module.destroy({ where: { "MID" : id } });
        res.status(200).json({ message: 'Module successfully deleted!' });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.get('/edit/:id', async (req, res) => { // FOR TESTING PURPOSES ONLY
    try {
        const module = await Module.findByPk(req.params.id);
        res.status(200).json({module});
    } catch { };
});

export default router;