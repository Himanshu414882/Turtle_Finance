// routes/assignAdvisor.js
const express = require("express");
const mongoose = require('mongoose'); 
const router = express.Router();
const Client = require("../../models/client");

/*router.post("/clients/:clientId/assign-advisor", async (req, res) => {
  const { advisorId } = req.body;
  const { clientId } = req.params;

  try {
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: "Client not found" });

    client.advisorId = advisorId;
    await client.save();

    return res.status(200).json({ message: "Advisor assigned successfully", client });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});*/


router.post("/clients/:clientId/assign-advisor", async (req, res) => {
  const { advisorId } = req.body;
  const { clientId } = req.params;

  try {
    // Validate advisorId is a valid ObjectId if needed
    if (!mongoose.Types.ObjectId.isValid(advisorId)) {
      return res.status(400).json({ message: "Invalid advisor ID" });
    }

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: "Client not found" });

    // Check if advisor is already assigned 
    const isAlreadyAssigned = client.advisors.some(adv => adv.equals(advisorId));
    if (isAlreadyAssigned) {
      return res.status(400).json({ message: "Advisor already assigned to this client" });
    }

    // Add the new advisor to the advisors array
    client.advisors.push(advisorId);
    await client.save();

    // Optionally populate the advisor details if needed
    await client.populate('advisors');
    
    return res.status(200).json({ 
      message: "Advisor assigned successfully", 
      client 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
