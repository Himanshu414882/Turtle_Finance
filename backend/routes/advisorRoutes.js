const express = require('express');
const router = express.Router();
const Advisor = require('../models/advisor')
const multer = require('multer');
const File  = require('../models/fileModel'); // Import your models



/*router.get('/advisors',async (req, res) => {
    try {
        const fetchAllAdvisors = await Advisor.find({});
        res.status(200).json(fetchAllAdvisors);
    }
    catch (e) {
        res.status(400).json({ msg: "Oops , Something went Wrong while fetching the advisors" });
    }
});*/




router.get('/advisors', async (req, res) => {
    try {
        const fetchAllAdvisors = await Advisor.find({})
            .populate('profilePictureId'); // populate the File document
        
        res.status(200).json(fetchAllAdvisors);
    } catch (e) {
        console.error(e);
        res.status(400).json({ msg: "Oops, something went wrong while fetching the advisors" });
    }
});


router.post('/addAdvisor', async (req, res) => {
    try {
        const advisorData = req.body;
        await Advisor.create(advisorData);
        res.status(200).json({ msg: "Advisor has been added sucessfully" });
    }
    catch (e) {
        res.status(400).json({ msg: "Oops , Something went Wrong while creating a advisor" })
    }
});


router.get('/advisors/:id/editAdvisors', async (req, res) => {
    try {
        const { id } = req.params;
        const advisor = await Advisor.findById(id);
        // console.log(Advisor);
        res.status(200).json(advisor);
    }
    catch (e) {
        res.status(400).json({ msg: "Oops , Something went Wrong while fetching the data for a Advisor to edit it" })
    }
});





/*router.patch('/advisors/:id/editAdvisors', async (req, res) => {
    try {
        const { id } = req.params;
        const advisorData = req.body;
        const updatedAdvisor = await Advisor.findByIdAndUpdate(id, advisorData, {
            new: true,
            runValidators: true,
        });
        res.status(200).json(updatedAdvisor);

    } catch (e) {
        //  Original generic error message
        let response = {
            msg: "Oops , Something went Wrong while editing the data for a advisor"
        };

        //  Mongoose validation errors (e.g., enum, required, etc.)
        if (e.name === "ValidationError") {
            response.details = {};
            for (let field in e.errors) {
                response.details[field] = e.errors[field].message;
            }
        }

        //  MongoDB duplicate key errors (e.g., email or phone must be unique)
        if (e.code === 11000) {
            response.msg = "Duplicate field error";
            response.field = Object.keys(e.keyValue);
            response.value = Object.values(e.keyValue);
        }

        //  Log to server for dev debugging
        console.error("Edit Advisor Error:", e);

        res.status(400).json(response);
    }
});
*/

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

/*router.patch('/advisors/:id/editAdvisors', upload.single('profilePicture'), async (req, res) => {
    try {
        const { id } = req.params;
        const advisorData = req.body;

        // Create file record
         if (req.file) {
        const profilePicture = new File({
                filename: req.file.originalname,
                contentType: req.file.mimetype,
                size: req.file.size,
                data: req.file.buffer,
                //uploadedBy: userId,
                advisorId: id
              });
            }

        const savedFile = await aadhaarFile.save();
  
        const updatedAdvisor = await Advisor.findByIdAndUpdate(id, advisorData, {
            
            new: true,
            runValidators: true,
        });
        res.status(200).json(updatedAdvisor);

    } catch (e) {
        //  Original generic error message
        let response = {
            msg: "Oops , Something went Wrong while editing the data for a advisor"
        };

        //  Mongoose validation errors (e.g., enum, required, etc.)
        if (e.name === "ValidationError") {
            response.details = {};
            for (let field in e.errors) {
                response.details[field] = e.errors[field].message;
            }
        }

        //  MongoDB duplicate key errors (e.g., email or phone must be unique)
        if (e.code === 11000) {
            response.msg = "Duplicate field error";
            response.field = Object.keys(e.keyValue);
            response.value = Object.values(e.keyValue);
        }

        //  Log to server for dev debugging
        console.error("Edit Advisor Error:", e);

        res.status(400).json(response);
    }
});*/




router.patch('/advisors/:id/editAdvisors', upload.single('profilePicture'), async (req, res) => {
  try {
    const { id } = req.params;
    const advisorData = req.body;

    // Validate advisor exists
    const existingAdvisor = await Advisor.findById(id);
    if (!existingAdvisor) {
      return res.status(404).json({ msg: 'Advisor not found' });
    }

    // Prepare update object
    const updateData = { ...advisorData };

    // Handle file upload if present
    let savedFile = null;
    if (req.file) {
      // Create file record
      const profilePicture = new File({
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        size: req.file.size,
        data: req.file.buffer,
        advisorId: id,
        fileType: 'profilePicture'
      });

      savedFile = await profilePicture.save();
      
      // Add file reference to advisor data
      updateData.profilePictureId = savedFile._id;
    }

    // Update advisor
    const updatedAdvisor = await Advisor.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedAdvisor) {
      return res.status(400).json({ msg: 'Advisor update failed' });
    }

    // Prepare response
    const response = {
      msg: 'Advisor updated successfully',
      advisor: updatedAdvisor
    };

    if (savedFile) {
      response.file = {
        id: savedFile._id,
        name: savedFile.filename,
        size: savedFile.size
      };
    }

    res.status(200).json(response);

  } catch (e) {
    // Error handling
    let response = {
      msg: "Oops, something went wrong while editing the advisor data",
      error: e.message
    };

    // Mongoose validation errors
    if (e.name === "ValidationError") {
      response.msg = "Validation failed";
      response.details = {};
      for (let field in e.errors) {
        response.details[field] = e.errors[field].message;
      }
      return res.status(400).json(response);
    }

    // MongoDB duplicate key errors
    if (e.code === 11000) {
      response.msg = "Duplicate field error";
      response.field = Object.keys(e.keyValue);
      response.value = Object.values(e.keyValue);
      return res.status(409).json(response);
    }

    // File upload errors
    if (e instanceof multer.MulterError) {
      if (e.code === 'LIMIT_FILE_SIZE') {
        response.msg = 'File size too large. Maximum 5MB allowed';
      } else {
        response.msg = 'File upload error';
      }
      return res.status(400).json(response);
    }

    // Log full error for debugging
    console.error("Edit Advisor Error:", e);

    res.status(500).json(response);
  }
});






router.delete('/advisors/:id/', async(req,res)=>{

    const {id} = req.params;
    const deleteAdvisor = await Advisor.findByIdAndDelete(id);
    if(!deleteAdvisor){
       return res.status(404).json({msg:"The Advisor does not exists or cannot be fetched"})
    }
    res.status(200).json({msg : "The Advisor has been successfully deleted"})
})



module.exports = {
    advisorRoutes: router
}












