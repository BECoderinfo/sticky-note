const express = require('express');
const router = express.Router();
const {
    createNote,
    getAllNotes,
    getNoteById,
    updateNote,
    deleteNote,
    filterNotesbyLabel,
    filterNotesByDate,
    searchNotes,
    pinUnpinNote,
    archiveNote,
    getPinnedNotes,
    getArchivedNotes,
    addAttachment,
    removeAttachment
} = require('../Controllers/noteController');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });


// Routes
router.post('/create', createNote);
router.get('/getbyUser/:userId', getAllNotes);
router.get('/get/:id', getNoteById);
router.put('/update/:id', updateNote);
router.delete('/delete/:id', deleteNote);

// Filter
router.get('/filterByLabel/:userId/:labelId', filterNotesbyLabel);
router.get('/filterByDate/:userId', filterNotesByDate);
router.get('/search/:userId/:query', searchNotes);

// Note Settings
router.put('/pinUnpin/:id', pinUnpinNote);
router.put('/archive/:id', archiveNote);
router.get('/getPinnedNotes/:userId', getPinnedNotes);
router.get('/getArchivedNotes/:userId', getArchivedNotes);

//Attechment
router.put('/addAttachment/:id', upload.array('files', 10), addAttachment);
router.put('/removeAttachment/:id/:index', removeAttachment);

module.exports = router;
