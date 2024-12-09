const express = require('express');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname); 
    }
});
const upload = multer({ storage: storage });

const adminRouter = express.Router();
const { adminCreate, adminLogin, Sequre, profileUpdate, adminGetById, changePassword, forgetPassword, otpVerification } = require('../Controllers/adminController');

adminRouter.get('/sequre', Sequre);
adminRouter.post('/create', adminCreate);
adminRouter.post('/login', adminLogin);
adminRouter.get('/get/:adminId', adminGetById);
adminRouter.put('/update/:adminId', upload.single('profileImage'), profileUpdate);
adminRouter.put('/changepassword', changePassword);
// adminRouter.get('/dash',adminDashboard)
adminRouter.post('/forgetpassword', forgetPassword);
adminRouter.post('/otpverification', otpVerification);

module.exports = adminRouter;