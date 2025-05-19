const express = require('express');
const router = express.Router();
const RiskProfile = require('../../models/riskProfile');
const { protect, authorizeRoles } = require('../../middleware/authMiddleware'); // Import middleware

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType } = require('docx');
const  docxToPdf  = require('docx-pdf');
const docxTemplates = require('docx-templates');
const moment = require('moment');
const multer = require('multer');
const FormData = require('form-data');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');


// GET all risk (protected, only admins can access)
/*router.get("/riskData", protect, authorizeRoles('client'), async (req, res) => {
    try {
        const fetchAllRiskData = await RiskProfile.find({});
        res.status(200).json(fetchAllRiskData);
    } catch (e) {
        res.status(400).json({ msg: "Oops , Something went Wrong" });
    }
});
*/

// GET risk profile for the logged-in client only
router.get("/riskData", protect, authorizeRoles('client'), async (req, res) => {
    try {
        const userId = req.user._id;

        const clientRiskData = await RiskProfile.findOne({ userId });

        if (!clientRiskData) {
            return res.status(404).json({ msg: "No risk profile found for this client." });
        }

        res.status(200).json(clientRiskData);
    } catch (e) {
        console.error("Error fetching risk profile:", e.message);
        res.status(400).json({ msg: "Oops, something went wrong." });
    }
});



// POST add a new riskProfile (protected, only client can access)
/*router.post('/addRiskData', protect, authorizeRoles('client'), async (req, res) => {
    try {
        const clientRiskData = req.body;
        await RiskProfile.create(clientRiskData);
        res.status(200).json({ msg: "Client risk data has been added successfully" });
    } catch (e) {
        res.status(400).json({ msg: "Oops , Something went Wrong while creating a client risk data" });
    }
});*/

// POST add a new riskProfile (protected, only client can access)
router.post('/addRiskData', protect, authorizeRoles('client'), async (req, res) => {
    try {
        const clientRiskData = req.body;

        // Add userId from the authenticated user to the body
        clientRiskData.userId = req.user._id;

        // Check if a risk profile already exists for this user
        const existingProfile = await RiskProfile.findOne({ userId: req.user._id });
        if (existingProfile) {
            return res.status(400).json({ msg: "Risk profile already submitted by this user." });
        }

        await RiskProfile.create(clientRiskData);
        res.status(200).json({ msg: "Client risk data has been added successfully." });
    } catch (e) {
        console.error("Error adding risk profile:", e.message);
        res.status(400).json({ msg: "Oops, something went wrong while creating a client risk data." });
    }
});


const config = {
    UPLOAD_FOLDER: 'uploads',
    DIGIO_UPLOAD_URL: process.env.DIGIO_UPLOAD_URL,
    DIGIO_CLIENT_ID: process.env.DIGIO_CLIENT_ID,
    DIGIO_CLIENT_SECRET: process.env.DIGIO_CLIENT_SECRET
};
const upload = multer({ dest: 'uploads/' });

// Helper functions
function calculateAge(birthDate) {
    if (!birthDate) {
        throw new Error("Birth date is required");
    }

    let birth;
    
    // Try parsing as Date object first
    if (birthDate instanceof Date) {
        birth = birthDate;
    } 
    // Try parsing as ISO string (e.g., "1990-05-20T00:00:00.000Z")
    else if (typeof birthDate === 'string') {
        birth = new Date(birthDate);
        
        // Try alternative formats if ISO parse fails
        if (isNaN(birth.getTime())) {
            // Try removing timezone information
            const datePart = birthDate.split('T')[0];
            birth = new Date(datePart);
            
            // Try another common format if still invalid
            if (isNaN(birth.getTime())) {
                // Try parsing as "MM/DD/YYYY"
                const parts = birthDate.split(/[-/]/);
                if (parts.length === 3) {
                    birth = new Date(`${parts[1]}/${parts[2]}/${parts[0]}`);
                }
            }
        }
    } else {
        throw new Error("Invalid birth date type - must be Date object or string");
    }

    // Final validation
    if (isNaN(birth.getTime())) {
        throw new Error(`Invalid date format: ${birthDate}. Please use ISO format (YYYY-MM-DD), MM/DD/YYYY, or a Date object`);
    }

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}
// Route handler
/*router.get('/upload-document',protect, authorizeRoles('client'), upload.single('document'), async (req, res) => {
    try {
        const contractCopyPath = path.join(config.UPLOAD_FOLDER, 'FilledContract.docx');
        const pdfPath = contractCopyPath.replace('.docx', '.pdf');
 

        const userId = req.user._id;

        const clientRiskData = await RiskProfile.findOne({ userId });
        //const clientRiskData = req.body;
        // Convert clientRiskData object to array format similar to Python code
        const risk_profile_sheet_row_data = [
            clientRiskData.fullName,        // 0
            clientRiskData.panNumber,         // 1
            clientRiskData.addressLine1,            // 2
            clientRiskData.addressLine2,           // 3
            clientRiskData.phoneNumber,         // 4
            clientRiskData.emailAddress,         // 5
            clientRiskData.gender,         // 6
            clientRiskData.maritalStatus,  // 7
            clientRiskData.dateOfBirth,             // 8

            clientRiskData.sons,     // 9
            clientRiskData.daughters,          // 10
            clientRiskData.dependentParents,       // 11
            clientRiskData.dependentSiblings,      // 12
            clientRiskData.dependentParentsInLaw, // 13
            clientRiskData.sourceOfIncome,  // 14
            clientRiskData.parentsSourceOfIncome, //15
            clientRiskData.currentMonthlyIncome, // 16
            clientRiskData.currentMonthlyExpenses,  // 17
            clientRiskData.totalInvestment,    // 18
            clientRiskData.totalEmis, // 19
            clientRiskData.investmentHorizon,     // 20
            clientRiskData.equityMarketKnowledge, // 21
            clientRiskData.investmentObjective, // 22
            clientRiskData.holdingPeriodForLoss, // 23
            clientRiskData.reactionToDecline,    // 24
            
        ];

        
        // Get today's date
        const today = new Date();
        const LOE_Date = {
            day: today.getDate(),
            month: today.toLocaleString('default', { month: 'long' }),
            year: today.getFullYear()
        };
        
        //const signer_email = clientRiskData.emailAddress || 'hs414882@gmail.com';
        const signer_email = 'hs414882@gmail.com'
        const signer_name = clientRiskData.fullName;
        const contractTemplatePath = path.join('static', 'Contract.docx');

        // Copy template (in Node.js we'll just read it)
        const template = fs.readFileSync(contractTemplatePath);

        // Get client info
       // const risk_profile_sheet_row_data = clientInfo(signer_email);

        // Determine salutation
        let Salutation;
        if (risk_profile_sheet_row_data[6] === "Male") {
            Salutation = "Mr " + risk_profile_sheet_row_data[0];
        } else if (risk_profile_sheet_row_data[7] === "Married") {
            Salutation = "Mrs " + risk_profile_sheet_row_data[0];
        } else {
            Salutation = "Ms " + risk_profile_sheet_row_data[0];
        }

        // Calculate age
        console.log(risk_profile_sheet_row_data[8])
        const Age = calculateAge(risk_profile_sheet_row_data[8]);
        
        if (!Age) {
            return res.status(400).json({ error: "Age format does not match" });
        }

        // Calculate EMI ratio
        const EMI_Income_ratio = parseInt(risk_profile_sheet_row_data[19]) / parseInt(risk_profile_sheet_row_data[16]);

        // Risk assessment calculations
        const Q1 = {"Upto 2 years":1, "2-3 years":2, "3-5 years":3, "5-10 years":4, "10+ years":5};
        const Q3 = {
            "I am a novice. I don't understand the markets at all": 1,
            "I have basic understanding of investing. I understand the risks and basic investment": 2,
            "I have an amateur interest in investing. I have invested earlier on my own. I understand how markets fluctuate and the pros and cons of different investment classes.": 3,
            "I am an experienced investor. I have invested in different markets and understand different investment strategies. I have my own investment philosophy.": 4
        };
        Q4 = {"Very unstable":1, "Unstable":2, "Somewhat stable":3, "Stable":4, "Very Stable":5}
        Q5 = {"I cannot consider any Loss":1, "I can consider Loss of 4% if the possible Gains are of 10%":2,
              "I can consider Loss of 8% if the possible Gains are of 22%":3, "I can consider Loss of 14% if the possible Gains are of 30%":4,
              "I can consider Loss of 25% if the possible Gains are of 50%":5}
        Q6 = {"Will not hold & cash in immediately if there is an erosion of my capital": 1,
              "I’d hold for 3 months": 2, "I’d hold for 6 months": 3, "I’d hold for one year": 4,
              "I’d hold for up to two years": 5, "I’d hold for more than two years.": 6}
        Q7 = {"Cut losses immediately and liquidate all investments. Capital preservation is paramount.": 1,
              "Cut your losses and transfer investments to safer asset classes.": 2,
              "You would be worried, but would give your investments a little more time.": 3,
              "You are ok with volatility and accept decline in portfolio value as a part of investing. You would keep your investments as they are": 4,
              "You would add to your investments to bring the average buying price lower. You are confident about your investments and are not perturbed by notional losses.": 5}

        // ... other question mappings ...

        const Score1 = Q1[risk_profile_sheet_row_data[20]];
        const Score3 = Q3[risk_profile_sheet_row_data[21]];
        const Score4 = Q4[risk_profile_sheet_row_data[22]];
        const Score5 = Q5[risk_profile_sheet_row_data[23]];
        const Score6 = Q6[risk_profile_sheet_row_data[24]];
        const Score7 = Q7[risk_profile_sheet_row_data[25]];
        // ... other scores ...

        let Age_Group, Score2;
        if( Age===null ) return;
        else if (Age > 50) {
            Age_Group = "51 years & above";
            Score2 = 1;
        } else if (Age > 35) {
            Age_Group = "36 - 50 years";
            Score2 = 2;
        } else if (Age > 24) {
            Age_Group = "25 - 35 years";
            Score2 = 3;
        } else{
            Age_Group = "Less than 25 years";
            Score2 = 4;
        }
       

        let ratio_category, Score8;
        if (EMI_Income_ratio === 0) {
            ratio_category = "None - No Loans";
            Score8 = 5;
        } else if (EMI_Income_ratio < 0.1) {
            ratio_category = "less than 10%";
            Score8 = 4;
        } 
        else if (EMI_Income_ratio<0.2){
                ratio_category = "10% to 20%"
                Score8 = 3
        }
        else if (EMI_Income_ratio<0.3){
                ratio_category = "20% to 30%"
                Score8 = 2
            }
        else{
                ratio_category = "Above 30%"
                Score8 = 1
            }
        // ... other ratio conditions ...

        const Total_Score = Score1 + Score2 + Score3 + Score4 + Score5 + Score6 + Score7 + Score8;

        let risk_assessment, point1, point2, point3, point4;
        if (Total_Score < 19) {
            risk_assessment = "Conservative";
            point1 = "0 to 10% of equity - domestic and international.";
            point2 = "10% to 100% of fixed income / debt / conservative hybrid funds";
            point3 = "10% to 100% of Fixed Deposits";
            point4 = "0 to 75 % in Gold, and real estate";
        } 
        else if (Total_Score < 30){
              risk_assessment = "Moderate"
              point1 = "Max 67% of equity - domestic and international."
              point2 = "10% to 80% of fixed income / debt / conservative hybrid funds"
              point3 = "10% to 100% of Fixed Deposits"
              point4 = "0 to 75 % in Gold, and real estate"
        }
            else{
              risk_assessment = "Aggressive"
              point1 = "Max 95% of equity - domestic and international."
              point2 = "10% to 50% of fixed income / debt / conservative hybrid funds"
              point3 = "10% to 50% of Fixed Deposits"
              point4 = "0 to 75 % in Gold, and real estate"
            }
        // ... other risk assessment conditions ...

        // Create a new document with the template
        const result = await docxTemplates.createReport({
            template,
            data: {
                CLIENTNAME: Salutation,
                TODAYDATE: LOE_Date.day.toString(),
                ONTH: LOE_Date.month,
                YEAR: LOE_Date.year.toString(),
                RISKASSESSMENT: risk_assessment.toUpperCase(),
                POINT1: point1,
                POINT2: point2,
                POINT3: point3,
                POINT4: point4,
                // Add other template variables here
            },
            // Additional options for table processing if needed
        });

        // Save the filled document
        fs.writeFileSync(contractCopyPath, result);

        // Convert to PDF
        await new Promise((resolve, reject) => {
            docxToPdf(contractCopyPath, pdfPath, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Prepare Digio API request
        const pdfName = path.basename(pdfPath);
        const requestPayload = {
            file_name: pdfName,
            signers: [
                {
                    identifier: signer_email,
                    name: signer_name,
                    sign_type: "aadhaar",
                    reason: "agreement"
                }
            ],
            expire_in_days: 10,
            send_sign_link: true,
            notify_signers: true,
            generate_access_token: true
        };

        // Create form data
        const formData = new FormData();
        formData.append('file', fs.createReadStream(pdfPath), {
            filename: pdfName,
            contentType: 'application/pdf'
        });
        formData.append('request', JSON.stringify(requestPayload), {
            contentType: 'application/json'
        });

        // Make the Digio API request
        const response = await axios.post(config.DIGIO_UPLOAD_URL, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: 'Basic ' + Buffer.from(`${config.DIGIO_CLIENT_ID}:${config.DIGIO_CLIENT_SECRET}`).toString('base64')
            }
        });

        // Clean up files
        [contractCopyPath, pdfPath].forEach(filePath => {
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.error("Cleanup error:", err);
                }
            }
        });

        // Return the response
        res.json(response.data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});*/



/*router.get('/upload-document',protect, authorizeRoles('client'), upload.single('document'), async (req, res) => {
    try {
        const contractCopyPath = path.join(config.UPLOAD_FOLDER, 'FilledContract.docx');
        const pdfPath = contractCopyPath.replace('.docx', '.pdf');
 

        const userId = req.user._id;

        const clientRiskData = await RiskProfile.findOne({ userId });
        //const clientRiskData = req.body;
        // Convert clientRiskData object to array format similar to Python code
        const risk_profile_sheet_row_data = [
            clientRiskData.fullName,        // 0
            clientRiskData.panNumber,         // 1
            clientRiskData.addressLine1,            // 2
            clientRiskData.addressLine2,           // 3
            clientRiskData.phoneNumber,         // 4
            clientRiskData.emailAddress,         // 5
            clientRiskData.gender,         // 6
            clientRiskData.maritalStatus,  // 7
            clientRiskData.dateOfBirth,             // 8

            clientRiskData.sons,     // 9
            clientRiskData.daughters,          // 10
            clientRiskData.dependentParents,       // 11
            clientRiskData.dependentSiblings,      // 12
            clientRiskData.dependentParentsInLaw, // 13
            clientRiskData.sourceOfIncome,  // 14
            clientRiskData.parentsSourceOfIncome, //15
            clientRiskData.currentMonthlyIncome, // 16
            clientRiskData.currentMonthlyExpenses,  // 17
            clientRiskData.totalInvestment,    // 18
            clientRiskData.totalEmis, // 19
            clientRiskData.investmentHorizon,     // 20
            clientRiskData.equityMarketKnowledge, // 21
            clientRiskData.investmentObjective, // 22
            clientRiskData.holdingPeriodForLoss, // 23
            clientRiskData.reactionToDecline,    // 24
            
        ];

        
        // Get today's date
        const today = new Date();
        const LOE_Date = {
            day: today.getDate(),
            month: today.toLocaleString('default', { month: 'long' }),
            year: today.getFullYear()
        };
        
        //const signer_email = clientRiskData.emailAddress || 'hs414882@gmail.com';
        const signer_email = 'hs414882@gmail.com'
        const signer_name = clientRiskData.fullName;
        const contractTemplatePath = path.join('static', 'Contract.docx');

        // Copy template (in Node.js we'll just read it)
        const template = fs.readFileSync(contractTemplatePath);

        // Get client info
       // const risk_profile_sheet_row_data = clientInfo(signer_email);

        // Determine salutation
        let Salutation;
        if (risk_profile_sheet_row_data[6] === "Male") {
            Salutation = "Mr " + risk_profile_sheet_row_data[0];
        } else if (risk_profile_sheet_row_data[7] === "Married") {
            Salutation = "Mrs " + risk_profile_sheet_row_data[0];
        } else {
            Salutation = "Ms " + risk_profile_sheet_row_data[0];
        }

        // Calculate age
        console.log(risk_profile_sheet_row_data[8])
        const Age = calculateAge(risk_profile_sheet_row_data[8]);
        
        if (!Age) {
            return res.status(400).json({ error: "Age format does not match" });
        }

        // Calculate EMI ratio
        const EMI_Income_ratio = parseInt(risk_profile_sheet_row_data[19]) / parseInt(risk_profile_sheet_row_data[16]);

        // Risk assessment calculations
        const Q1 = {"Upto 2 years":1, "2-3 years":2, "3-5 years":3, "5-10 years":4, "10+ years":5};
        const Q3 = {
            "I am a novice. I don't understand the markets at all": 1,
            "I have basic understanding of investing. I understand the risks and basic investment": 2,
            "I have an amateur interest in investing. I have invested earlier on my own. I understand how markets fluctuate and the pros and cons of different investment classes.": 3,
            "I am an experienced investor. I have invested in different markets and understand different investment strategies. I have my own investment philosophy.": 4
        };
        Q4 = {"Very unstable":1, "Unstable":2, "Somewhat stable":3, "Stable":4, "Very Stable":5}
        Q5 = {"I cannot consider any Loss":1, "I can consider Loss of 4% if the possible Gains are of 10%":2,
              "I can consider Loss of 8% if the possible Gains are of 22%":3, "I can consider Loss of 14% if the possible Gains are of 30%":4,
              "I can consider Loss of 25% if the possible Gains are of 50%":5}
        Q6 = {"Will not hold & cash in immediately if there is an erosion of my capital": 1,
              "I’d hold for 3 months": 2, "I’d hold for 6 months": 3, "I’d hold for one year": 4,
              "I’d hold for up to two years": 5, "I’d hold for more than two years.": 6}
        Q7 = {"Cut losses immediately and liquidate all investments. Capital preservation is paramount.": 1,
              "Cut your losses and transfer investments to safer asset classes.": 2,
              "You would be worried, but would give your investments a little more time.": 3,
              "You are ok with volatility and accept decline in portfolio value as a part of investing. You would keep your investments as they are": 4,
              "You would add to your investments to bring the average buying price lower. You are confident about your investments and are not perturbed by notional losses.": 5}

        // ... other question mappings ...

        const Score1 = Q1[risk_profile_sheet_row_data[20]];
        const Score3 = Q3[risk_profile_sheet_row_data[21]];
        const Score4 = Q4[risk_profile_sheet_row_data[22]];
        const Score5 = Q5[risk_profile_sheet_row_data[23]];
        const Score6 = Q6[risk_profile_sheet_row_data[24]];
        const Score7 = Q7[risk_profile_sheet_row_data[25]];
        // ... other scores ...

        let Age_Group, Score2;
        if( Age===null ) return;
        else if (Age > 50) {
            Age_Group = "51 years & above";
            Score2 = 1;
        } else if (Age > 35) {
            Age_Group = "36 - 50 years";
            Score2 = 2;
        } else if (Age > 24) {
            Age_Group = "25 - 35 years";
            Score2 = 3;
        } else{
            Age_Group = "Less than 25 years";
            Score2 = 4;
        }
       

        let ratio_category, Score8;
        if (EMI_Income_ratio === 0) {
            ratio_category = "None - No Loans";
            Score8 = 5;
        } else if (EMI_Income_ratio < 0.1) {
            ratio_category = "less than 10%";
            Score8 = 4;
        } 
        else if (EMI_Income_ratio<0.2){
                ratio_category = "10% to 20%"
                Score8 = 3
        }
        else if (EMI_Income_ratio<0.3){
                ratio_category = "20% to 30%"
                Score8 = 2
            }
        else{
                ratio_category = "Above 30%"
                Score8 = 1
            }
        // ... other ratio conditions ...

        const Total_Score = Score1 + Score2 + Score3 + Score4 + Score5 + Score6 + Score7 + Score8;

        let risk_assessment, point1, point2, point3, point4;
        if (Total_Score < 19) {
            risk_assessment = "Conservative";
            point1 = "0 to 10% of equity - domestic and international.";
            point2 = "10% to 100% of fixed income / debt / conservative hybrid funds";
            point3 = "10% to 100% of Fixed Deposits";
            point4 = "0 to 75 % in Gold, and real estate";
        } 
        else if (Total_Score < 30){
              risk_assessment = "Moderate"
              point1 = "Max 67% of equity - domestic and international."
              point2 = "10% to 80% of fixed income / debt / conservative hybrid funds"
              point3 = "10% to 100% of Fixed Deposits"
              point4 = "0 to 75 % in Gold, and real estate"
        }
            else{
              risk_assessment = "Aggressive"
              point1 = "Max 95% of equity - domestic and international."
              point2 = "10% to 50% of fixed income / debt / conservative hybrid funds"
              point3 = "10% to 50% of Fixed Deposits"
              point4 = "0 to 75 % in Gold, and real estate"
            }
        // ... other risk assessment conditions ...

// Generate FilledContract.docx from template first
const zipFromTemplate = new PizZip(template);
const docFromTemplate = new Docxtemplater(zipFromTemplate, {
    paragraphLoop: true,
    linebreaks: true,
});

docFromTemplate.setData({
    CLIENTNAME: Salutation,
    TODAYDATE: LOE_Date.day.toString(),
    MONTH: LOE_Date.month,
    YEAR: LOE_Date.year.toString(),
    RISKASSESSMENT: risk_assessment.toUpperCase(),
    POINT1: point1,
    POINT2: point2,
    POINT3: point3,
    POINT4: point4,
});

try {
    docFromTemplate.render();
} catch (error) {
    console.error("Error rendering filled DOCX:", error);
    throw error;
}

const filledBuffer = docFromTemplate.getZip().generate({ type: 'nodebuffer' });
fs.writeFileSync(contractCopyPath, filledBuffer); // NOW this file exists


await new Promise((resolve, reject) => {
    docxToPdf(contractCopyPath, pdfPath, (err) => {
        if (err) reject(err);
        else resolve();
    });
});



        // Prepare Digio API request
        const pdfName = path.basename(pdfPath);
        const requestPayload = {
            file_name: pdfName,
            signers: [
                {
                    identifier: signer_email,
                    name: signer_name,
                    sign_type: "aadhaar",
                    reason: "agreement"
                }
            ],
            expire_in_days: 10,
            send_sign_link: true,
            notify_signers: true,
            generate_access_token: true
        };

        // Create form data
        const formData = new FormData();
        formData.append('file', fs.createReadStream(pdfPath), {
            filename: pdfName,
            contentType: 'application/pdf'
        });
        formData.append('request', JSON.stringify(requestPayload), {
            contentType: 'application/json'
        });

        // Make the Digio API request
        const response = await axios.post(config.DIGIO_UPLOAD_URL, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: 'Basic ' + Buffer.from(`${config.DIGIO_CLIENT_ID}:${config.DIGIO_CLIENT_SECRET}`).toString('base64')
            }
        });

        // Clean up files
        [contractCopyPath, pdfPath].forEach(filePath => {
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.error("Cleanup error:", err);
                }
            }
        });

        // Return the response
        res.json(response.data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
*/



/*function wrapText(text, maxCharsPerLine = 60) {
    const cleaned = text
        .replace(/\u00A0/g, ' ')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .trim();

    const words = cleaned.split(' ');
    let lines = [];
    let currentLine = '';

    for (let word of words) {
        if ((currentLine + word).length <= maxCharsPerLine) {
            currentLine += word + ' ';
        } else {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
        }
    }

    if (currentLine.length) {
        lines.push(currentLine.trim());
    }

    return lines.join('\n');

}*/

function wrapText(text, maxCharsPerLine = 60) {
    const cleaned = text
        .replace(/\u00A0/g, ' ')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .trim();

    const words = cleaned.split(' ');
    let lines = [];
    let currentLine = '';

    // Helper to break a long word on slash or hyphen
    function breakWord(word) {
        const delimiters = ['/', '-'];
        let segments = [word];
        let usedDelimiter = null;

        for (let delimiter of delimiters) {
            if (word.includes(delimiter)) {
                segments = word.split(delimiter);
                usedDelimiter = delimiter;
                break;
            }
        }

        let brokenLines = [];
        let compoundLine = '';

        for (let i = 0; i < segments.length; i++) {
            let part = segments[i];
            let withDelimiter = i < segments.length - 1 && usedDelimiter ? part + usedDelimiter : part;

            if ((compoundLine + withDelimiter).length <= maxCharsPerLine) {
                compoundLine += withDelimiter;
            } else {
                if (compoundLine.length) {
                    brokenLines.push(compoundLine);
                    compoundLine = withDelimiter;
                } else {
                    // Still too long — force-break this part
                    let remaining = withDelimiter;
                    while (remaining.length > maxCharsPerLine) {
                        brokenLines.push(remaining.slice(0, maxCharsPerLine));
                        remaining = remaining.slice(maxCharsPerLine);
                    }
                    compoundLine = remaining;
                }
            }
        }

        if (compoundLine) {
            brokenLines.push(compoundLine);
        }

        return brokenLines;
    }

    for (let word of words) {
        if (word.length > maxCharsPerLine) {
            const brokenParts = breakWord(word);

            for (let part of brokenParts) {
                if ((currentLine + part).length <= maxCharsPerLine) {
                    currentLine += part + ' ';
                } else {
                    lines.push(currentLine.trim());
                    currentLine = part + ' ';
                }
            }
        } else {
            if ((currentLine + word).length <= maxCharsPerLine) {
                currentLine += word + ' ';
            } else {
                lines.push(currentLine.trim());
                currentLine = word + ' ';
            }
        }
    }

    if (currentLine.length) {
        lines.push(currentLine.trim());
    }

    return lines.join('\n');
}



const { PDFDocument, rgb } = require('pdf-lib');
//const fs = require('fs');
//const path = require('path');




router.post('/upload-document', protect, authorizeRoles('client'), upload.single('document'), async (req, res) => {
    try {
        const pdfOutputPath = path.join(config.UPLOAD_FOLDER, 'FilledContract.pdf');
        const userId = req.user._id;

        const clientRiskData = await RiskProfile.findOne({ userId });
        const risk_profile_sheet_row_data = [
            // ... your existing data mapping ...
            clientRiskData.fullName,        // 0
            clientRiskData.panNumber,         // 1
            clientRiskData.addressLine1,            // 2
            clientRiskData.addressLine2,           // 3
            clientRiskData.phoneNumber,         // 4
            clientRiskData.emailAddress,         // 5
            clientRiskData.gender,         // 6
            clientRiskData.maritalStatus,  // 7
            clientRiskData.dateOfBirth,             // 8

            clientRiskData.sons,     // 9
            clientRiskData.daughters,          // 10
            clientRiskData.dependentParents,       // 11
            clientRiskData.dependentSiblings,      // 12
            clientRiskData.dependentParentsInLaw, // 13
            clientRiskData.sourceOfIncome,  // 14
            clientRiskData.parentsSourceOfIncome, //15
            clientRiskData.currentMonthlyIncome, // 16
            clientRiskData.currentMonthlyExpenses,  // 17
            clientRiskData.totalInvestment,    // 18
            clientRiskData.totalEmis, // 19
            clientRiskData.investmentHorizon,     // 20
            clientRiskData.equityMarketKnowledge, // 21
            
            clientRiskData.investmentObjective, // 22
            clientRiskData.holdingPeriodForLoss, // 23
            clientRiskData.reactionToDecline,    // 24
            clientRiskData.incomeNature
        ];
        console.log(risk_profile_sheet_row_data)
        // Get today's date
        const today = new Date();
        const LOE_Date = {
            day: today.getDate(),
            month: today.toLocaleString('default', { month: 'long' }),
            year: today.getFullYear()
        };
        
        const signer_email = 'hs414882@gmail.com';
        const signer_name = clientRiskData.fullName;
        const pdfTemplatePath = path.join('static', 'ContractTemplateNRI.pdf'); // Change to PDF template

        // Load the PDF template
        const existingPdfBytes = fs.readFileSync(pdfTemplatePath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        
        // Get the first page
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        
         // Determine salutation
         let Salutation;
         if (risk_profile_sheet_row_data[6] === "Male") {
             Salutation = "Mr " + risk_profile_sheet_row_data[0];
         } else if (risk_profile_sheet_row_data[7] === "Married") {
             Salutation = "Mrs " + risk_profile_sheet_row_data[0];
         } else {
             Salutation = "Ms " + risk_profile_sheet_row_data[0];
         }
 
         // Calculate age
         console.log(risk_profile_sheet_row_data[8])
         const Age = calculateAge(risk_profile_sheet_row_data[8]);
         
        /* if (!Age) {
            console.log(Age)
             return res.status(400).json({ error: "Age format does not match" });
         }*/
 
         // Calculate EMI ratio
         const EMI_Income_ratio = parseInt(risk_profile_sheet_row_data[19]) / parseInt(risk_profile_sheet_row_data[16]);
 
         // Risk assessment calculations
         const Q1 = {"Upto 2 years":1, "2-3 years":2, "3-5 years":3, "5-10 years":4, "10+ years":5};
         const Q3 = {
             "I am a novice. I don't understand the markets at all": 1,
             "I have basic understanding of investing. I understand the risks and basic investment": 2,
             "I have an amateur interest in investing. I have invested earlier on my own. I understand how markets fluctuate and the pros and cons of different investment classes.": 3,
             "I am an experienced investor. I have invested in different markets and understand different investment strategies. I have my own investment philosophy.": 4
         };
         Q4 = {"Very unstable":1, "Unstable":2, "Somewhat stable":3, "Stable":4, "Very Stable":5}
         Q5 = {"I cannot consider any Loss":1, "I can consider Loss of 4% if the possible Gains are of 10%":2,
               "I can consider Loss of 8% if the possible Gains are of 22%":3, "I can consider Loss of 14% if the possible Gains are of 30%":4,
               "I can consider Loss of 25% if the possible Gains are of 50%":5}
         Q6 = {"Will not hold & cash in immediately if there is an erosion of my capital": 1,
               "I’d hold for 3 months": 2, "I’d hold for 6 months": 3, "I’d hold for one year": 4,
               "I’d hold for up to two years": 5, "I’d hold for more than two years.": 6}
         Q7 = {"Cut losses immediately and liquidate all investments. Capital preservation is paramount.": 1,
               "Cut your losses and transfer investments to safer asset classes.": 2,
               "You would be worried, but would give your investments a little more time.": 3,
               "You are ok with volatility and accept decline in portfolio value as a part of investing. You would keep your investments as they are": 4,
               "You would add to your investments to bring the average buying price lower. You are confident about your investments and are not perturbed by notional losses.": 5}
 
         // ... other question mappings ...
 
       /*  const Score1 = Q1[risk_profile_sheet_row_data[20]];
         const Score3 = Q3[risk_profile_sheet_row_data[21]];
         const Score4 = Q4[risk_profile_sheet_row_data[26]];
         const Score5 = Q5[risk_profile_sheet_row_data[23].trim()];
         const Score6 = Q6[risk_profile_sheet_row_data[24]];
         const Score7 = Q7[risk_profile_sheet_row_data[25]];
         // ... other scores ...*/
         const Score1 = Q1[clientRiskData.investmentHorizon];
         const Score3 = Q3[clientRiskData.equityMarketKnowledge];
         const Score4 = Q4[clientRiskData.incomeNature];
         const Score5 = Q5[clientRiskData.investmentObjective];
         const Score6 = Q6[clientRiskData.holdingPeriodForLoss];
         const Score7 = Q7[clientRiskData.reactionToDecline];
 
         let Age_Group, Score2;
         if( Age===null ) return;
         else if (Age > 50) {
             Age_Group = "51 years & above";
             Score2 = 1;
         } else if (Age > 35) {
             Age_Group = "36 - 50 years";
             Score2 = 2;
         } else if (Age > 24) {
             Age_Group = "25 - 35 years";
             Score2 = 3;
         } else{
             Age_Group = "Less than 25 years";
             Score2 = 4;
         }
        
 
         let ratio_category, Score8;
         if (EMI_Income_ratio === 0) {
             ratio_category = "None - No Loans";
             Score8 = 5;
         } else if (EMI_Income_ratio < 0.1) {
             ratio_category = "less than 10%";
             Score8 = 4;
         } 
         else if (EMI_Income_ratio<0.2){
                 ratio_category = "10% to 20%"
                 Score8 = 3
         }
         else if (EMI_Income_ratio<0.3){
                 ratio_category = "20% to 30%"
                 Score8 = 2
             }
         else{
                 ratio_category = "Above 30%"
                 Score8 = 1
             }
         // ... other ratio conditions ...
 
         const Total_Score = Score1 + Score2 + Score3 + Score4 + Score5 + Score6 + Score7 + Score8;
 
         let risk_assessment, point1, point2, point3, point4;
         if (Total_Score < 19) {
             risk_assessment = "Conservative";
             point1 = "0 to 10% of equity - domestic and international.";
             point2 = "10% to 100% of fixed income / debt / conservative hybrid funds";
             point3 = "10% to 100% of Fixed Deposits";
             point4 = "0 to 75 % in Gold, and real estate";
         } 
         else if (Total_Score < 30){
               risk_assessment = "Moderate"
               point1 = "Max 67% of equity - domestic and international."
               point2 = "10% to 80% of fixed income / debt / conservative hybrid funds"
               point3 = "10% to 100% of Fixed Deposits"
               point4 = "0 to 75 % in Gold, and real estate"
         }
             else{
               risk_assessment = "Aggressive"
               point1 = "Max 95% of equity - domestic and international."
               point2 = "10% to 50% of fixed income / debt / conservative hybrid funds"
               point3 = "10% to 50% of Fixed Deposits"
               point4 = "0 to 75 % in Gold, and real estate"
             }

        // Add text to the PDF at specific positions
        const { width, height } = firstPage.getSize();
        
        // Example of adding text - you'll need to adjust coordinates for your template
        firstPage.drawText(Salutation, {
            x: 254,
            y: height-380,
            size: 18,
            color: rgb(0, 0, 0),
        });

        firstPage.drawText(Salutation, {
            x: 109,
            y: height-576,
            size: 12,
            color: rgb(0, 0, 0),
        });

        firstPage.drawText(risk_profile_sheet_row_data[1], {
            x: 109,
            y: height-600,
            size: 12,
            color: rgb(0, 0, 0),
        });

        firstPage.drawText(risk_profile_sheet_row_data[2], {
            x: 109,
            y: height-640,
            size: 12,
            color: rgb(0, 0, 0),
        });

        firstPage.drawText(risk_profile_sheet_row_data[3], {
            x: 109,
            y: height-680,
            size: 12,
            color: rgb(0, 0, 0),
        });

        firstPage.drawText(risk_profile_sheet_row_data[4], {
            x: 109,
            y: height-716,
            size: 12,
            color: rgb(0, 0, 0),
        });

        firstPage.drawText(risk_profile_sheet_row_data[5], {
            x: 109,
            y: height-740,
            size: 12,
            color: rgb(0, 0, 0),
        });


        const sixteenthPage = pages[15];
        sixteenthPage.drawText(String(Score1), {
            x: 551,
            y: height-278,
            size: 12,
            color: rgb(0, 0, 0),
        });
        sixteenthPage.drawText(String(Score2), {
            x: 551,
            y: height-304,
            size: 12,
            color: rgb(0, 0, 0),
        });
        sixteenthPage.drawText(String(Score3), {
            x: 551,
            y: height-354,
            size: 12,
            color: rgb(0, 0, 0),
        });
        sixteenthPage.drawText(String(Score4), {
            x: 551,
            y: height-383,
            size: 12,
            color: rgb(0, 0, 0),
        });
        sixteenthPage.drawText(String(Score5), {
            x: 551,
            y: height-417,
            size: 12,
            color: rgb(0, 0, 0),
        });
        sixteenthPage.drawText(String(Score6), {
            x: 551,
            y: height-457,
            size: 12,
            color: rgb(0, 0, 0),
        });
        sixteenthPage.drawText(String(Score7), {
            x: 551,
            y: height-511,
            size: 12,
            color: rgb(0, 0, 0),
        });
        sixteenthPage.drawText(String(Score8), {
            x: 551,
            y: height-534,
            size: 12,
            color: rgb(0, 0, 0),
        });
        sixteenthPage.drawText(String(Total_Score), {
            x: 541,
            y: height-555,
            size: 12,
            color: rgb(0, 0, 0),
        });


        sixteenthPage.drawText(clientRiskData.investmentHorizon, {
            x: 314,
            y: height-266,
            size: 9,
            color: rgb(0, 0, 0),
        });
        console.log(Age_Group)

        sixteenthPage.drawText(Age_Group, {
            x: 314,
            y: height-301,
            size: 9,
            color: rgb(0, 0, 0),
        });

        const q3 = String(clientRiskData.equityMarketKnowledge);
const Wrap3 = wrapText(q3, 50); // Gives \n-separated lines
const lines = Wrap3.split('\n');

let startX = 314;
let startY = height - 317;

lines.forEach((line, i) => {
    sixteenthPage.drawText(line, {
        x: startX,
        y: startY - i * 9, // 12 is the line height. Adjust as needed.
        size: 9,
        color: rgb(0, 0, 0),
    });
});

const q4 = String(clientRiskData.incomeNature);
const Wrap4 = wrapText(q4, 50); // Gives \n-separated lines
 const lines4 = Wrap4.split('\n');
 startX = 314;
startY = height - 381;

lines4.forEach((line, i) => {
    sixteenthPage.drawText(line, {
        x: startX,
        y: startY - i * 9, // 12 is the line height. Adjust as needed.
        size: 9,
        color: rgb(0, 0, 0),
    });
});

const q5 = String(clientRiskData.investmentObjective);
console.log(q5)
const Wrap5 = wrapText(q5, 45); // Gives \n-separated lines
const lines5 = Wrap5.split('\n');
 startX = 314;
startY = height - 405;

lines5.forEach((line, i) => {
    sixteenthPage.drawText(line, {
        x: startX,
        y: startY - i * 9, // 12 is the line height. Adjust as needed.
        size: 9,
        color: rgb(0, 0, 0),
    });
});

const q6 = String(clientRiskData.holdingPeriodForLoss);
console.log(q6)
const Wrap6 = wrapText(q6, 45); // Gives \n-separated lines
const lines6 = Wrap6.split('\n');
 startX = 314;
startY = height - 442;

lines6.forEach((line, i) => {
    sixteenthPage.drawText(line, {
        x: startX,
        y: startY - i * 9, // 12 is the line height. Adjust as needed.
        size: 9,
        color: rgb(0, 0, 0),
    });
});



const q7 = String(clientRiskData.reactionToDecline);
console.log(q7)
const Wrap7 = wrapText(q7, 45); // Gives \n-separated lines
const lines7 = Wrap7.split('\n');
 startX = 314;
startY = height - 480;

lines7.forEach((line, i) => {
    sixteenthPage.drawText(line, {
        x: startX,
        y: startY - i * 9, // 12 is the line height. Adjust as needed.
        size: 9,
        color: rgb(0, 0, 0),
    });
});

const q8 = String(ratio_category);
console.log(q8)
const Wrap8 = wrapText(q8, 45); // Gives \n-separated lines
const lines8 = Wrap8.split('\n');
 startX = 314;
startY = height - 530;

lines8.forEach((line, i) => {
    sixteenthPage.drawText(line, {
        x: startX,
        y: startY - i * 9, // 12 is the line height. Adjust as needed.
        size: 9,
        color: rgb(0, 0, 0),
    });
});

sixteenthPage.drawText(risk_assessment, {
    x: 170,
    y: height-579,
    size: 9,
    color: rgb(0, 0, 0),
});

sixteenthPage.drawText(point1, {
    x: 73,
    y: height-625,
    size: 9,
    color: rgb(0, 0, 0),
});
sixteenthPage.drawText(point2, {
    x: 73,
    y: height-639,
    size: 9,
    color: rgb(0, 0, 0),
});
sixteenthPage.drawText(point3, {
    x: 73,
    y: height-653,
    size: 9,
    color: rgb(0, 0, 0),
});
sixteenthPage.drawText(point4, {
    x: 73,
    y: height-667,
    size: 9,
    color: rgb(0, 0, 0),
});



const fifteenthPage = pages[14];
fifteenthPage.drawText(String(Age), {
    x: 39,
    y: height-272,
    size: 9,
    color: rgb(0, 0, 0),
});
fifteenthPage.drawText(String(clientRiskData.maritalStatus), {
    x: 121,
    y: height-272,
    size: 9,
    color: rgb(0, 0, 0),
});
fifteenthPage.drawText(String(clientRiskData.daughters), {
    x: 206,
    y: height-272,
    size: 9,
    color: rgb(0, 0, 0),
});
fifteenthPage.drawText(String(clientRiskData.sons), {
    x: 274,
    y: height-272,
    size: 9,
    color: rgb(0, 0, 0),
});
fifteenthPage.drawText(String(clientRiskData.dependentParents), {
    x: 352,
    y: height-272,
    size: 9,
    color: rgb(0, 0, 0),
});
fifteenthPage.drawText(String(clientRiskData.dependentParentsInLaw),{
    x: 442,
    y: height-272,
    size: 9,
    color: rgb(0, 0, 0),
});
fifteenthPage.drawText(String(clientRiskData.dependentSiblings),{
    x: 552,
    y: height-272,
    size: 9,
    color: rgb(0, 0, 0),
});

let sourceOfIncome = String(String(clientRiskData.sourceOfIncome));
console.log(sourceOfIncome)
sourceOfIncome = wrapText(sourceOfIncome, 8); // Gives \n-separated lines
let sentences = sourceOfIncome.split('\n');
 startX = 41;
startY = height - 409;

sentences.forEach((line, i) => {
    fifteenthPage.drawText(line, {
        x: startX,
        y: startY - i * 9, // 12 is the line height. Adjust as needed.
        size: 9,
        color: rgb(0, 0, 0),
    });
});

let parentsSourceOfIncome = String(String(clientRiskData.parentsSourceOfIncome));
console.log(parentsSourceOfIncome)
parentsSourceOfIncome = wrapText(parentsSourceOfIncome, 11); // Gives \n-separated lines
sentences = parentsSourceOfIncome.split('\n');
 startX = 122;
startY = height - 409;

sentences.forEach((line, i) => {
    fifteenthPage.drawText(line, {
        x: startX,
        y: startY - i * 9, // 12 is the line height. Adjust as needed.
        size: 9,
        color: rgb(0, 0, 0),
    });
});

let currentMonthlyIncome = String(String(clientRiskData.currentMonthlyIncome));
console.log(currentMonthlyIncome)
currentMonthlyIncome = wrapText(currentMonthlyIncome, 11); // Gives \n-separated lines
sentences = currentMonthlyIncome.split('\n');
 startX = 207;
startY = height - 462;

sentences.forEach((line, i) => {
    fifteenthPage.drawText(line, {
        x: startX,
        y: startY - i * 9, // 12 is the line height. Adjust as needed.
        size: 9,
        color: rgb(0, 0, 0),
    });
});

let currentMonthlyExpenses = String(String(clientRiskData.currentMonthlyExpenses));
console.log(currentMonthlyExpenses)
currentMonthlyExpenses = wrapText(currentMonthlyExpenses, 11); // Gives \n-separated lines
sentences = currentMonthlyExpenses.split('\n');
 startX = 275;
startY = height - 462;

sentences.forEach((line, i) => {
    fifteenthPage.drawText(line, {
        x: startX,
        y: startY - i * 9, // 12 is the line height. Adjust as needed.
        size: 9,
        color: rgb(0, 0, 0),
    });
});

let totalInvestment = String(String(clientRiskData.totalInvestment));
console.log(totalInvestment)
totalInvestment = wrapText(totalInvestment, 11); // Gives \n-separated lines
sentences = totalInvestment.split('\n');
 startX = 352;
startY = height - 462;

sentences.forEach((line, i) => {
    fifteenthPage.drawText(line, {
        x: startX,
        y: startY - i * 9, // 12 is the line height. Adjust as needed.
        size: 9,
        color: rgb(0, 0, 0),
    });
});

let totalEmis = String(String(clientRiskData.totalEmis));
console.log(totalEmis)
totalEmis = wrapText(totalEmis, 11); // Gives \n-separated lines
sentences = totalEmis.split('\n');
 startX = 443;
startY = height - 462;

sentences.forEach((line, i) => {
    fifteenthPage.drawText(line, {
        x: startX,
        y: startY - i * 9, // 12 is the line height. Adjust as needed.
        size: 9,
        color: rgb(0, 0, 0),
    });
});

fifteenthPage.drawText(`${LOE_Date.day}-${LOE_Date.month}-${LOE_Date.year}`, {
            x: 259,
            y: height - 153,
            size: 10,
            color: rgb(0, 0, 0),
        });
        
        /*firstPage.drawText(risk_assessment.toUpperCase(), {
            x: 100,
            y: height - 140,
            size: 12,
            color: rgb(0, 0, 0),
        });*/

        const eleventhPage = pages[10];
        eleventhPage.drawText(Salutation, {
            x: 37,
            y: height - 640,
            size: 12,
            color: rgb(0, 0, 0),
        });


         const thirdPage = pages[2];
        thirdPage.drawText(`${LOE_Date.day} of ${LOE_Date.month} ${LOE_Date.year}`, {
            x: 278,
            y: height - 77,
            size: 10,
            color: rgb(0, 0, 0),
        });
        
        
        thirdPage.drawText(Salutation, {
            x: 313,
            y: height - 207,
            size: 10,
            color: rgb(0, 0, 0),
        });

         
        thirdPage.drawText(Salutation, {
            x: 87,
            y: height - 94,
            size: 10,
            color: rgb(0, 0, 0),
        });
        // Add more fields as needed...

        // Save the modified PDF
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(pdfOutputPath, pdfBytes);

        // Prepare Digio API request (same as before)
        const pdfName = path.basename(pdfOutputPath);
        const requestPayload = {
            file_name: pdfName,
            signers: [
                {
                    identifier: signer_email,
                    name: signer_name,
                    sign_type: "Electronic",
                    reason: "agreement"
                }
            ],
            expire_in_days: 10,
            send_sign_link: true,
            notify_signers: true,
            generate_access_token: true
        };

        // Create form data and send to Digio (same as before)
        const formData = new FormData();
        formData.append('file', fs.createReadStream(pdfOutputPath), {
            filename: pdfName,
            contentType: 'application/pdf'
        });
        formData.append('request', JSON.stringify(requestPayload), {
            contentType: 'application/json'
        });

        const response = await axios.post(config.DIGIO_UPLOAD_URL, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: 'Basic ' + Buffer.from(`${config.DIGIO_CLIENT_ID}:${config.DIGIO_CLIENT_SECRET}`).toString('base64')
            }
        });

        // Clean up
        if (fs.existsSync(pdfOutputPath)) {
            try {
                fs.unlinkSync(pdfOutputPath);
            } catch (err) {
                console.error("Cleanup error:", err);
            }
        }
        console.log(response.data)
       return res.json(response.data);
       //return response.json()

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});





module.exports = {
    riskProfileRoutes: router
}