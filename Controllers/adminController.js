const Admin = require('../Models/admin');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const otpGenerator = require('otp-generator')
const nodemailer = require('nodemailer');

// Token Verification (Secured Route)
const Sequre = async (req, res, next) => {
    try {
        const adminToken = req.headers.token;

        if (!adminToken) {
            throw new Error('Please send token');
        }

        const decoded = jwt.verify(adminToken, process.env.JWT_ADMIN_SECRET);
        // const admin = await Admin.findById(decoded.id);

        res.status(200).json({
            status: 'success',
            message: 'Token verified',
            decoded,
        });

    } catch (error) {
        return res.status(401).json({
            status: 'failed',
            message: error.message,
        });
    }
};

// Admin Creation
const adminCreate = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate fields
        if (!name || !email || !password) {
            throw new Error('All fields are required');
        }

        // Check if email already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            throw new Error('Admin with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin
        const newAdmin = await Admin.create({ name, email, password: hashedPassword });

        res.status(201).json({
            status: 'success',
            message: 'Admin created successfully',
            admin: newAdmin,
        });
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message,
        });
    }
};

// Admin Login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new Error('All fields are required');
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            throw new Error('Admin not found');
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            throw new Error('Incorrect password');
        }

        // Generate JWT Token
        const adminToken = jwt.sign({ id: admin._id }, process.env.JWT_ADMIN_SECRET);

        res.status(200).json({
            status: 'success',
            message: 'Logged in successfully',
            adminToken,
        });
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message,
        });
    }
};

//Admin profile Update
const profileUpdate = async (req, res) => {
    try {
        const { adminId } = req.params;
        const { name, email } = req.body; 
        const profileImage = req.file ? req.file.filename : null;

        const admin = await Admin.findById(adminId);
        if (!admin) {
            throw new Error('Admin not found');
        }

        const updateData = {};
        if (name) {
            updateData.name = name;
        }

        if (email) {
            updateData.email = email;
        }

        if (profileImage) {
            if (admin.profileImage) {
                const oldImagePath = path.join(__dirname, '../public', admin.profileImage);
                try {
                    await fs.promises.unlink(oldImagePath);
                } catch (err) {
                    console.error(`Failed to delete old image: ${oldImagePath}`, err);
                }
            }
            const imageURL = `images/${profileImage}`;
            updateData.profileImage = imageURL;
        }
        const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updateData, { new: true });

        res.status(200).json({
            status: 'success',
            message: 'Admin profile updated successfully',
            updatedAdmin
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

//Admin get 
const adminGetById = async (req, res) => {
    try {
        const { adminId } = req.params;
        const admin = await Admin.findById(adminId);
        if (!admin) {
            throw new Error('Admin not found');
        }
        res.status(200).json({
            status: 'success',
            message: 'Admin fetched successfully',
            admin
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

//Forget Password
const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            throw new Error('Email is required');
        }
        const admin = await Admin.findOne({ email });
        if (!admin) {
            throw new Error('Admin not found');
        }

        const otp = otpGenerator.generate(4, {upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false});
        admin.otp = otp;
        admin.otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        await admin.save();

        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: `StikeyNote:${process.env.EMAIL_ID}`,
                pass: process.env.API_KEY,
            },
            service: process.env.EMAIL_SERVICE,
        });

        const mailOptions = {
            from: `StikeyNote:${process.env.EMAIL_ID}`,
            to: admin.email,
            subject: 'Your OTP Code',
            html: `<p  style="font-size: 20px"><b>Hi ${admin.name}</b></p><p style="font-size: 20px">Password Reset OTP code is <span style="color: blue">${otp}</span>. It is valid for 10 minute.</p>`,
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                throw new Error(error);
            }
            res.json({});
        });

        res.status(200).json({
            status: 'success',
            message: 'Password reset OTP sent to your email'
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

//OTP Verification
const otpVerification = async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) {
            throw new Error('OTP is required');
        }
        const admin = await Admin.findOne({ otp });
        if (!admin) {
            throw new Error('Invalid OTP');
        }

        if (Date.now() > admin.otpExpires) {
            admin.otp = null;
            admin.otpExpires = null;
            await admin.save();
            throw new Error('OTP has expired');
        }

        admin.otp = undefined;
        admin.otpExpires = undefined;
        await admin.save();

        res.status(200).json({
            status: 'success',
            message: 'OTP verified successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

//change password
const changePassword = async (req, res) => {
    try {
        const {email, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            throw new Error('password do not match');
        }
        const admin = await Admin.findOne({ email });
        if (!admin) {
            throw new Error('Admin not found');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        admin.password = hashedPassword;
        await admin.save();
        res.status(200).json({
            status: 'success',
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Admin Dashboard
// const adminDashboard = async (req, res) => {
//     try {
//         // Fetch total students
//         const totalStudents = await Student.countDocuments();

//         // Fetch total notices
//         const totalNotices = await Notice.countDocuments();

//         // Fetch total teachers
//         const totalTeachers = await Teacher.countDocuments();

//         //Fetch total Courses
//         const totalCourses = await Course.countDocuments();

//         // Fetch total Inquiries
//         const totalInquiries = await Inquary.countDocuments();

//         //Fetch total Batches
//         const totalBatches = await Classes.countDocuments();

//         res.status(200).json({
//             status: 'success',
//             data: {
//                 totalStudents,
//                 totalNotices,
//                 totalTeachers,
//                 totalCourses,
//                 totalInquiries,
//                 totalBatches
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: 'fail',
//             message: error.message
//         });
//     }
// };

module.exports = { adminCreate, adminLogin, Sequre, profileUpdate, adminGetById, changePassword, forgetPassword, otpVerification };
