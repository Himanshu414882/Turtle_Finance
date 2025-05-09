/*const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const KYC = require("../../models/kycData");


const router = express.Router();

// Create MongoDB connection
const conn = mongoose.createConnection(process.env.DB_URL);


let gfs;
conn.once("open", () => {
    console.log("MongoDB GridFS connection open");
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Multer GridFS Storage setup
const storage = new GridFsStorage({
  url: process.env.DB_URL,
  file: (req, file) => {
    if (!file) return null; // prevent undefined crash
    return {
        filename: `${Date.now()}-${file.originalname}`,
        bucketName: "uploads",
      };
}});

const upload = multer({ storage });

// POST route to add KYC data (files only)
router.post("/submitKYC",protect,authorizeRoles("client"),upload.fields([{ name: "aadhaar", maxCount: 1 },{ name: "pan", maxCount: 1 },]),async (req, res) => {
    try {
        const kycData = req.body;

        // Add userId from the authenticated user to the body
        kycData.userId = req.user._id;
      //const userId = req.user._id;

      const aadhaarFile = req.files?.aadhaar?.[0];
const panFile = req.files?.pan?.[0];

if (!aadhaarFile || !panFile) {
  return res.status(400).json({ msg: "Both Aadhaar and PAN files are required." });
}
      // Prevent duplicate submissions
      // Check if a risk profile already exists for this user
      

      const existing = await KYC.findOne({ userId: req.user._id  });
      if (existing) {
        return res.status(400).json({ msg: "KYC already submitted by this user." });
      }

      

      console.log("req.files:", req.files);
      const newKYC = new KYC({
        userId,
        aadhaarFileId: req.files["aadhaar"] ? req.files["aadhaar"][0].id : undefined,
        panFileId: req.files["pan"] ? req.files["pan"][0].id : undefined,
      });

      await newKYC.save();
      res.status(200).json({ msg: "KYC data submitted successfully." });
    } catch (err) {
      console.error("Error submitting KYC:", err.message);
      res.status(500).json({ msg: "An error occurred while submitting KYC." });
    }
  }
);

module.exports = router;*/

/*const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const { GridFsStorage } = require('multer-gridfs-storage');
const KYC = require('../../models/kycData');
const { protect, authorizeRoles } = require('../../middleware/authMiddleware');

const router = express.Router();

// Initialize GridFS bucket
let gfsBucket;
const conn = mongoose.createConnection(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

conn.once('open', () => {
  gfsBucket = new GridFSBucket(conn.db, {
    bucketName: 'kycUploads'
  });
});

// Custom storage engine
const storage = new GridFsStorage({
  db: Promise.resolve(conn),
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      try {
        if (!file) {
          throw new Error('No file received');
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
          throw new Error('Only PDF, JPEG, or PNG files allowed');
        }

        const filename = `${req.user._id}-aadhaar-${Date.now()}-${file.originalname}`;
        
        const fileInfo = {
          filename: filename,
          bucketName: 'kycUploads',
          metadata: {
            userId: req.user._id,
            documentType: 'aadhaar',
            uploadDate: new Date()
          }
        };

        resolve(fileInfo);
      } catch (err) {
        reject(err);
      }
    });
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Aadhaar KYC Submission Endpoint
router.post('/submitKYC',
  protect,
  authorizeRoles('client'),
  upload.single('aadhaar'),
  async (req, res) => {
    try {
      // Validate upload
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No Aadhaar file uploaded'
        });
      }

      // Check for existing KYC
      const existingKYC = await KYC.findOne({ userId: req.user._id });
      if (existingKYC) {
        // Clean up the orphaned file
        await gfsBucket.delete(req.file.id);
        return res.status(400).json({
          success: false,
          message: 'KYC already exists for this user'
        });
      }

      // Create new KYC record
      const newKYC = new KYC({
        userId: req.user._id,
        aadhaarFileId: req.file.id,
        status: 'pending'
      });

      await newKYC.save();

      return res.status(201).json({
        success: true,
        message: 'KYC submitted successfully',
        kycId: newKYC._id,
        documentId: req.file.id
      });

    } catch (error) {
      console.error('KYC submission error:', error);

      // Clean up any uploaded file if error occurred
      if (req.file?.id) {
        try {
          await gfsBucket.delete(req.file.id);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to process KYC submission',
        error: error.message
      });
    }
  }
);

module.exports = router;*/
const { protect, authorizeRoles } = require('../../middleware/authMiddleware'); // Import middleware
const express = require('express');
const router = express.Router();
const multer = require('multer');
const File  = require('../../models/fileModel'); // Import your models
const KYC  = require('../../models/kycData');

// Configure Multer for file uploads
const upload = multer({
    limits: {
      fileSize: 15 * 1024 * 1024 // 15MB limit (under MongoDB's 16MB)
    },
    fileFilter: (req, file, cb) => {
      // Validate file types
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
      }
      cb(null, true);
    }
  });


router.post('/aadhaar',protect,authorizeRoles("client"), upload.single('aadhaar'), async (req, res) => {
    console.log('REQ.FILE:', req.file);
console.log('REQ.BODY:', req.body);
    try {
      const { userId, clientId } = req.body; // Or get from auth middleware
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
  
      // Create file record
      const aadhaarFile = new File({
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        size: req.file.size,
        data: req.file.buffer,
        uploadedBy: userId,
        clientId: clientId
      });
  
      const savedFile = await aadhaarFile.save();
  
      // Update KYC record
      const kycRecord = await KYC.findOneAndUpdate(
        { userId: req.user._id },
        { $set: { aadhaarFileId: savedFile._id } },
        { upsert: true, new: true }
      );
  
      res.status(201).json({
        message: 'Aadhaar document uploaded successfully',
        fileId: savedFile._id,
        kycId: kycRecord._id
      });
  
    } catch (error) {
      console.error('Error uploading Aadhaar:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  });

  router.post('/pan', protect, authorizeRoles("client"), upload.single('pan'), async (req, res) => {
    try {
      // Get user ID from auth middleware (assuming protect middleware adds req.user)
      const { userId, clientId } = req.body; // Or get from auth middleware
      
      if (!req.file) {
        return res.status(400).json({ error: 'No PAN card file uploaded' });
      }

      // Validate PAN card file (example: check if it's PDF or image)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Only PDF, JPEG, or PNG files are allowed for PAN card' });
      }

      // Create PAN card file record
      const panFile = new File({
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        size: req.file.size,
        data: req.file.buffer,
        uploadedBy: userId,
        clientId: clientId, // Assuming clientId is stored in user object
        documentType: 'pan' // Add document type for easier identification
      });

      const savedFile = await panFile.save();

      // Update KYC record
      const kycRecord = await KYC.findOneAndUpdate(
        { userId: req.user._id },
        { $set: { panFileId: savedFile._id } },
        { upsert: true, new: true }
      );

      res.status(201).json({
        success: true,
        message: 'PAN card uploaded successfully',
        fileId: savedFile._id,
        kycId: kycRecord._id,
        documentType: 'pan'
      });

    } catch (error) {
      console.error('Error uploading PAN card:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to upload PAN card',
        //details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
});


router.get('/aadhaar/download', protect, authorizeRoles("client"), async (req, res) => {
  try {
    const kycRecord = await KYC.findOne({ userId: req.user._id });

    if (!kycRecord || !kycRecord.aadhaarFileId) {
      return res.status(404).json({ error: 'Aadhaar document not found' });
    }

    const aadhaarFile = await File.findById(kycRecord.aadhaarFileId);

    if (!aadhaarFile) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set headers for download
    res.set({
      'Content-Type': aadhaarFile.contentType,
      'Content-Disposition': `attachment; filename="${aadhaarFile.filename}"`
    });

    return res.send(aadhaarFile.data); // This will trigger file download in browser

  } catch (error) {
    console.error('Error downloading Aadhaar file:', error);
    res.status(500).json({ error: 'Failed to download Aadhaar document' });
  }
});






  module.exports = router;