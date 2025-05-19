const express = require('express');
const router = express.Router();
const SubscriptionPlan = require('../../models/subscription');
const { protect, authorizeRoles } = require('../../middleware/authMiddleware'); // Import middleware




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

module.exports = router; 
