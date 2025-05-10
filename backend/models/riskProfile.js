const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const RiskProfileSchema = new mongoose.Schema(
    {
        profileId: {
            type: String,
            default: uuidv4,
            unique: true,
            required: true,
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client", // assuming there's a Client model
            //required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // assuming there's a User model
            //required: true,
            unique: true,
        },

        fullName: {
            type: String,
            required: true,
        },
        panNumber: {
            type: String,
            required: true,
        },
        addressLine1: {
            type: String,
            required: true,
        },
        addressLine2: {
            type: String,
            default: null,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        emailAddress: {
            type: String,
            required: true,
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other", "Null"],
            default: "Null",
        },
        maritalStatus: {
            type: String,
            enum: ["Unmarried", "Married", "Divorced", "Separated", "Widow"],
            
        },
        dateOfBirth: {
            type: Date,
            required: true,
        },
        sons: {
            type: Number,
            default: 0,
        },
        daughters: {
            type: Number,
            default: 0,
        },
        dependentParents: {
            type: Number,
            default: 0,
        },
        dependentSiblings: {
            type: Number,
            default: 0,
        },
        dependentParentsInLaw: {
            type: Number,
            default: 0,
        },
        sourceOfIncome: {
            type: String,
            enum: ["Stable (Govt Job or Secure Private - example - Tata Steel, Reliance, LT)",
                "Profession - Doctor/Lawyer/Accountant/Architect",
                "Pvt - High Income at beginning but would peak and last as 15-20 years career - Marketing, Consulting, Tech jobs",
                "Self Business - Growth industry (10%+ YoY Growth)",
                "Self Business - Growth industry (10%+ YoY Growth)",
                "Business - Moderate Growth Industry (<10% YoY Growth)",
                "Retired - Pension",
                "Retired - No Pension"
            ],
            required: true,
        },
        parentsSourceOfIncome: {
            type: String,
            enum: ["Pension - Government / Or retirement planning",
                "Currently Working - Govt",
                "Currently Working - Private",
                "No Pension, lacked retirement planning",
                "Not Applicable (Parents not alive)"
            ],
            required: true,
        },
        currencyType: {
            type: String,
            enum:["Indian Rupee (INR)",
                "United States Dollar (USD)",
                "Great Britain Pound (GBP)",
                "Euros (EUR)",
                
            ]
        },
        currentMonthlyIncome: {
            type: Number,
            required: true,
        },
        currentMonthlyExpenses: {
            type: Number,
            required: true,
        },
        totalInvestment: {
            type: Number,
            required: true,
        },
        totalEmis: {
            type: Number,
            required: true,
        },
        investmentHorizon: {
            type: String,
            enum:["Upto 2 years",
                "2-3 years",
                "3-5 years",
                "5-10 years",
                "10+ years"
            ],
            required: true,
        },
        equityMarketKnowledge: {
            type: String,
            enum:["I am a novice. I don’t understand the markets at all",
                "I have basic understanding of investing. I understand the risks and basic investment",
                "I have an amateur interest in investing. I have invested earlier on my own. I understand how markets fluctuate and the pros and cons of different investment classes.",
                "I am an experienced investor. I have invested in different markets and understand different investment strategies. I have my own investment philosophy.",
               
            ],
            required: true,
        },
        incomeNature: {
            type: String,
            enum:["Very unstable",
                "Unstable",
                "Somewhat stable",
                "Stable",
                "Very Stable",
            ],
            required: true,
        },
        investmentObjective: {
            type: String,
            enum:["I cannot consider any Loss",
                "I can consider Loss of 4% if the possible Gains are of 10%",
                "I can consider Loss of 8% if the possible Gains are of 22%",
                "I can consider Loss of 14% if the possible Gains are of 30%",
                "I can consider Loss of 25% if the possible Gains are of 50%"
            ],
            required: true,
        },
        holdingPeriodForLoss: {
            type: String,
            enum: ["Will not hold & cash in immediately if there is an erosion of my capital",
                "I’d hold for 3 months",
                "I’d hold for 6 months",
                "I’d hold for one year",
                "I’d hold for up to two years",
                "I’d hold for more than two years."
            ],
            required: true,
        },
        reactionToDecline: {
            type: String,
            enum: ["Cut losses immediately and liquidate all investments. Capital preservation is paramount.",
                "Cut your losses and transfer investments to safer asset classes.",
                "You would be worried, but would give your investments a little more time.",
                "You are ok with volatility and accept decline in portfolio value as a part of investing. You would keep your investments as they are",
                "You would add to your investments to bring the average buying price lower. You are confident about your investments and are not perturbed by notional losses."
            ],
            required: true,
        },
        
        submittedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

//module.exports = mongoose.model("RiskProfile", RiskProfileSchema);
const RiskProfile = mongoose.model('RiskProfile', RiskProfileSchema);

module.exports = RiskProfile;