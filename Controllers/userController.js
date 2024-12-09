const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const User = require('../Models/user');
const path = require('path');
const fs = require('fs');

// Token Verification (Secured Route)
const Sequre = async (req, res, next) => {
    try {
        const userToken = req.headers.token;

        if (!userToken) {
            throw new Error('Please send token');
        }

        const decoded = jwt.verify(userToken, process.env.JWT_USER_SECRET);

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

// Create a new user
const createUser = async (req, res) => {
    try {
        const { name, phone, email, password } = req.body;

        if (!name || !phone || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ name, phone, email, password: hashedPassword });
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user,
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

//Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid Password' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_USER_SECRET);
        res.status(200).json({ success: true, message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, message: 'Users found successfully', users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get a single user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User found successfully', user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update a user
const updateUser = async (req, res) => {
    try {
        const { name, phone, email } = req.body;
        const profileImage = req.file;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const updateData = { name, phone, email };

        if (profileImage) {
            if (user.profileImage) {
                const oldImagePath = path.join(__dirname, '..', 'public', user.profileImage);
                try {
                    await fs.promises.unlink(oldImagePath);
                } catch (err) {
                    console.error(`Failed to delete old image: ${oldImagePath}`, err);
                }
            }

            const imageURL = `images/${profileImage.filename}`;
            updateData.profileImage = imageURL;
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser,
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};


// Delete a user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createUser,
    login,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    Sequre
};