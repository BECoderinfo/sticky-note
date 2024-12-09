const Note = require('../Models/note');
const path = require('path');
const fs = require('fs');

// Create a note
const createNote = async (req, res) => {
    try {
        const { title, description, label, user, color } = req.body;
        if (!title || !description || !label || !user) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const note = await Note.create({
            title,
            description,
            label,
            user,
            color
        });

        res.status(200).json({
            success: true,
            message: 'Note created successfully',
            note,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// Get all notes by user ID
const getAllNotes = async (req, res) => {
    try {

        const userId = req.params.userId;

        const notes = await Note.find({ user: userId, archived: false, pinned: false });
        res.status(200).json({
            success: true,
            message: 'Notes found successfully',
            notes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// Get a single note by ID
const getNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findById(id);
        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found',
            });
        }
        res.status(200).json({
            success: true,
            message: 'Note found successfully',
            note,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// Update a note
const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, label, user, color } = req.body;

        const note = await Note.findById(id);
        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found',
            });
        }

        const updatedNote = await Note.findByIdAndUpdate(id, req.body, { new: true });

        res.status(200).json({
            success: true,
            message: 'Note updated successfully',
            updatedNote,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// Delete a note
const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findByIdAndDelete(id);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found',
            });
        }

        if (note.document) {
            const filePath = path.join(__dirname, '../public', note.document);
            await deleteFile(filePath);
        }

        res.status(200).json({
            success: true,
            message: 'Note deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// Helper function to escape regular expressions
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Search notes by title width user ID
const searchNotes = async (req, res) => {
    try {
        const { userId, query } = req.params;
        const regex = new RegExp(escapeRegExp(query), 'i');
        const notes = await Note.find({ user: userId, title: { $regex: regex } });
        res.status(200).json({
            success: true,
            message: 'Notes found successfully',
            notes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// filter data by label
const filterNotesbyLabel = async (req, res) => {
    try {
        const { userId, labelId } = req.params;
        const notes = await Note.find({ user: userId, label: labelId }).populate('label');
        res.status(200).json({
            success: true,
            message: 'Notes found successfully',
            notes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// filter note by date
const filterNotesByDate = async (req, res) => {
    try {
        const { userId } = req.params;
        const { date } = req.body;

        const startOfDay = new Date(date);
        const endOfDay = new Date(date);

        endOfDay.setHours(23, 59, 59, 999);

        const notes = await Note.find({
            user: userId,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
        });

        res.status(200).json({
            success: true,
            message: 'Notes found successfully',
            notes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// pin note unPin
const pinUnpinNote = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findById(id);
        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found',
            });
        }
        note.pinned = !note.pinned;
        await note.save();
        res.status(200).json({
            success: true,
            message: 'Note pinned successfully',
            note,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// archived note
const archiveNote = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findById(id);
        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found',
            });
        }
        note.archived = !note.archived;
        await note.save();
        res.status(200).json({
            success: true,
            message: 'Note archived successfully',
            note,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

//get Pinned notes
const getPinnedNotes = async (req, res) => {
    try {
        const { userId } = req.params;

        const notes = await Note.find({ user: userId, pinned: true });

        res.status(200).json({
            success: true,
            message: 'Pinned notes found successfully',
            notes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

//get Archived notes
const getArchivedNotes = async (req, res) => {
    try {
        const { userId } = req.params;
        const notes = await Note.find({ user: userId, archived: true });

        res.status(200).json({
            success: true,
            message: 'Archived notes found successfully',
            notes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// Add attechment to note
const addAttachment = async (req, res) => {
    try {
        const noteId = req.params.id;
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        if (note.files.length >= 10) {
            return res.status(400).json({ message: 'Maximum number of files reached' });
        }

        const filesToAdd = req.files.map((file, index) => ({
            index: note.files.length + index,
            url: `images/${file.filename}`,
        }));
        
        if (note.files.length + filesToAdd.length > 10) {
            return res.status(400).json({ message: `Maximum number of files reached only ${10 - note.files.length} more files can be added` });
        }

        note.files.push(...filesToAdd);
        await note.save();

        res.status(200).json({
            message: 'Files added successfully',
            note,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Remove attachment
const removeAttachment = async (req, res) => {
    try {
        const noteId = req.params.id;
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        const fileIndex = req.params.index;
        const fileToRemove = note.files[fileIndex];
        if (!fileToRemove) {
            return res.status(400).json({ message: 'File not found' });
        }

        const filePath = path.join(__dirname, '../public', fileToRemove.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        note.files.splice(fileIndex, 1);

        // Update indices of remaining files
        note.files.forEach((file, index) => {
            file.index = index;
        });

        await note.save();
        res.status(200).json({
            message: 'File removed successfully',
            note,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};


module.exports = {
    createNote,
    getAllNotes,
    getNoteById,
    updateNote,
    deleteNote,
    searchNotes,
    filterNotesbyLabel,
    filterNotesByDate,
    pinUnpinNote,
    archiveNote,
    getPinnedNotes,
    getArchivedNotes,
    addAttachment,
    removeAttachment
};
