const express = require('express');
const router = express.Router();
const SubscriptionPlan = require('../../models/subscription');
const RiskProfile = require('../../models/riskProfile');
const { protect, authorizeRoles } = require('../../middleware/authMiddleware'); // Import middleware
const File  = require('../../models/fileModel'); // Import your models
const KYC  = require('../../models/kycData');




// POST: Add a new subscription plan (admin only)
/*router.post('/addPlan', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const { planName, priceRupees, priceDollar } = req.body;

        if (!planName || priceRupees == null) {
            return res.status(400).json({ msg: "planName, priceRupees are required" });
        }

        // Check if plan already exists
        const existingPlan = await SubscriptionPlan.findOne({ planName });
        if (existingPlan) {
            return res.status(409).json({ msg: "Plan with this name already exists" });
        }

        const newPlan = await SubscriptionPlan.create({
            planName,
            priceRupees,
            priceDollar,
            //billingCycle: billingCycle || 'monthly', // default to monthly
        });

        res.status(201).json({
            msg: "New subscription plan added successfully",
            plan: newPlan
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error adding new subscription plan" });
    }
});
*/

// PUT update subscription plan prices by planName (admin only)
/*router.put('/updatePlanByName/:planName', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const { priceRupees, priceDollar } = req.body;
        const { planName } = req.params;

        if (priceRupees == null || priceDollar == null) {
            return res.status(400).json({ msg: "Both priceRupees and priceDollar are required" });
        }

        const updatedPlan = await SubscriptionPlan.findOneAndUpdate(
            { planName: planName }, // find by planName
            { priceRupees, priceDollar },
            { new: true, runValidators: true }
        );

        if (!updatedPlan) {
            return res.status(404).json({ msg: "Plan not found" });
        }

        res.status(200).json({
            msg: `Prices for ${planName} plan updated successfully`,
            updatedPlan
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Error updating subscription plan prices" });
    }
});*/

router.put('/updatePlanByName/:planName', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const { priceRupees, priceDollar } = req.body;
        const { planName } = req.params;

        // Validate based on planName
        if (planName === 'Indian') {
            if (priceRupees == null) {
                return res.status(400).json({ msg: "priceRupees is required for Indian plan" });
            }
        } else if (planName === 'NRI') {
            if (priceRupees == null || priceDollar == null) {
                return res.status(400).json({ msg: "Both priceRupees and priceDollar are required for NRI plan" });
            }
        } else {
            return res.status(400).json({ msg: "Invalid planName. Only 'Indian' and 'NRI' are allowed." });
        }

        // Prepare update object dynamically
        const updateFields = {};
        if (priceRupees != null) updateFields.priceRupees = priceRupees;
        if (priceDollar != null) updateFields.priceDollar = priceDollar;

        const updatedPlan = await SubscriptionPlan.findOneAndUpdate(
            { planName },
            updateFields,
            { new: true, runValidators: true }
        );

        if (!updatedPlan) {
            return res.status(404).json({ msg: "Plan not found" });
        }

        res.status(200).json({
            msg: `Plan '${planName}' updated successfully`,
            updatedPlan
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Error updating subscription plan prices" });
    }
});


router.get('/getPlanByName/:planName', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const { planName } = req.params;

        // Validate allowed plan names
        if (planName !== 'Indian' && planName !== 'NRI') {
            return res.status(400).json({ msg: "Invalid planName. Only 'Indian' and 'NRI' are allowed." });
        }

        const plan = await SubscriptionPlan.findOne({ planName });

        if (!plan) {
            return res.status(404).json({ msg: "Plan not found" });
        }

        res.status(200).json({
            msg: `Plan '${planName}' fetched successfully`,
            plan
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Error fetching subscription plan" });
    }
});







// GET a specific client's risk profile by clientId (admin only)
router.get('/clients/:clientId/riskProfile', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const { clientId } = req.params;

        // Find the risk profile for the given clientId
        const profile = await RiskProfile.findOne({ clientId })
           // .populate('userId', 'email')  // optional: includes user's email
            //.populate('clientId');        // optional: includes full client details

        if (!profile) {
            return res.status(404).json({ msg: "Risk profile not found for this client." });
        }

        res.status(200).json({ data: profile });
    } catch (e) {
        console.error("Error fetching risk profile:", e.message);
        res.status(400).json({ msg: "Failed to fetch risk profile." });
    }
});


router.get('/clients/aadhaar/download/:clientId', protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const clientId = req.params.clientId;

    const kycRecord = await KYC.findOne({ clientId });

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

    return res.send(aadhaarFile.data);

  } catch (error) {
    console.error('Error downloading Aadhaar file:', error);
    res.status(500).json({ error: 'Failed to download Aadhaar document' });
  }
});


router.get('/clients/pan/download/:clientId', protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const clientId = req.params.clientId;

    const kycRecord = await KYC.findOne({ clientId });

    if (!kycRecord || !kycRecord.panFileId) {
      return res.status(404).json({ error: 'PAN document not found' });
    }

    const panFile = await File.findById(kycRecord.panFileId);

    if (!panFile) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set headers for download
    res.set({
      'Content-Type': panFile.contentType,
      'Content-Disposition': `attachment; filename="${panFile.filename}"`
    });

    return res.send(panFile.data);

  } catch (error) {
    console.error('Error downloading PAN file:', error);
    res.status(500).json({ error: 'Failed to download PAN document' });
  }
});


module.exports = router; 
