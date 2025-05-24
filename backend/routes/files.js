const express = require('express');
const router = express.Router();
//const Advisor = require('../models/advisor')
//const multer = require('multer');
const File  = require('../models/fileModel'); // Import your models




// Route to get image by ObjectId
router.get('/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).send("File not found");

    res.set("Content-Type", file.contentType);
    res.send(file.data); // Send raw image buffer
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;