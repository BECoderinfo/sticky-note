const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  createUser,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  Sequre
} = require('../Controllers/userController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'public', 'images');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Routes
router.get('/sequre', Sequre);
router.post('/create', createUser);
router.post('/login', login);                                    
router.get('/getall', getAllUsers);                               
router.get('/get/:id', getUserById);                              
router.put('/update/:id', upload.single('profileImage'), updateUser); 
router.delete('/delete/:id', deleteUser);                        

module.exports = router;
