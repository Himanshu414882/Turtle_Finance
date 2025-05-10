import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useDigio from './useDigio'; // Path to your hook

const ClientLayout = () => {
  // State to manage the current step in the onboarding process
  axios.defaults.withCredentials = true
    // const url = "http://localhost:8000";
    const url = import.meta.env.VITE_URL;
  const [currentStep, setCurrentStep] = useState(1);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  
  // State to hold form data for each step
  const [riskProfile, setRiskProfile] = useState({
    fullName: '',
    panNumber: '',
    addressLine1: '',
    addressLine2: '',
    phoneNumber: '',
    emailAddress: '',
    gender: '',
    maritalStatus: '',
    dateOfBirth: '',
    sons: 0,
  daughters: 0,
  dependentParents: 0,
  dependentSiblings: 0,
  dependentParentsInLaw: 0,
  sourceOfIncome: '',
  parentsSourceOfIncome: '',
  currencyType: '',
    currentMonthlyIncome: '',
    currentMonthlyExpenses: '',
    totalInvestment: '',
    totalEmis: '',
    investmentHorizon: '',
    equityMarketKnowledge: '',
    incomeNature: '',
    investmentObjective: '',
    holdingPeriodForLoss: '',
    reactionToDecline: '',
  });


  const riskProfileFields = [
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      note: 'as per your PAN card',
      placeholder: 'Enter your full name as per PAN card',
      required: true
    },
    {
      name: 'panNumber',
      label: 'PAN Number',
      type: 'text',
      note: '10 character alphanumeric as on PAN card',
      placeholder: 'ABCDE1234F',
      required: true,
      pattern: '[A-Z]{5}[0-9]{4}[A-Z]{1}',
      maxLength: 10
    },
    {
      name: 'addressLine1',
      label: 'Address Line 1',
      type: 'text',
      note: 'as per your Aadhaar card',
      placeholder: 'Address Line 1',
      required: true
    },
    {
      name: 'addressLine2',
      label: 'Address Line 2',
      type: 'text',
      note: 'as per your Aadhaar card (include your Pincode too)',
      placeholder: 'Address Line 2',
      required: true
    },
    {
      name: 'phoneNumber',
      label: 'Phone Number',
      type: 'text',
      note: 'as per your Aadhaar card',
      placeholder: 'Phone Number',
      required: true
    },
    {
      name: 'emailAddress',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Email Address',
      required: true
    },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      options: [
        { value: '', label: 'Select Gender' },
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' }
      ],
      required: true
    },
    {
      name: 'maritalStatus',
      label: 'Marital Status',
      type: 'select',
      options: [
        { value: '', label: 'Marital Status' },
        { value: 'Unmarried', label: 'Unmarried' },
        { value: 'Married', label: 'Married' },
        { value: 'Divorced', label: 'Divorced' },
        { value: 'Separated', label: 'Separated' },
        { value: 'Widow', label: 'Widow' }
      ],
      required: true
    },
    {
      name: 'dateOfBirth',
      label: 'Date of Birth',
      type: 'date',
      required: true
    },
    {
      name: 'sons',
      label: 'Number of Sons',
      type: 'number',
      placeholder: 'Number of Sons',
      min: 0
    },
    {
      name: 'daughters',
      label: 'Number of Daughters',
      type: 'number',
      placeholder: 'Number of Daughters',
      min: 0
    },
    {
      name: 'dependentParents',
      label: 'Dependent Parents',
      type: 'number',
      placeholder: 'Dependent Parents',
      min: 0
    },
    {
      name: 'dependentSiblings',
      label: 'Dependent Siblings',
      type: 'number',
      placeholder: 'Dependent Siblings',
      min: 0
    },
    {
      name: 'dependentParentsInLaw',
      label: 'Dependent Parents-in-Law',
      type: 'number',
      placeholder: 'Dependent Parents-in-Law',
      min: 0
    },
    {
      name: 'sourceOfIncome',
      label: 'Source of Income',
      type: 'select',
      options: [
        { value: '', label: 'Select Source of Income' },
        { value: 'Stable (Govt Job or Secure Private - example - Tata Steel, Reliance, LT)', 
          label: 'Stable (Govt Job or Secure Private)' },
        { value: 'Profession - Doctor/Lawyer/Accountant/Architect', 
          label: 'Profession - Doctor/Lawyer/Accountant/Architect' },
        { value: 'Pvt - High Income at beginning but would peak and last as 15-20 years career - Marketing, Consulting, Tech jobs', 
          label: 'Private - High Income Career (e.g., Marketing, Tech)' },
        { value: 'Self Business - Growth industry (10%+ YoY Growth)', 
          label: 'Self Business - Growth Industry (10%+ YoY)' },
        { value: 'Business - Moderate Growth Industry (<10% YoY Growth)', 
          label: 'Business - Moderate Growth Industry (<10% YoY)' },
        { value: 'Retired - Pension', 
          label: 'Retired - With Pension' },
        { value: 'Retired - No Pension', 
          label: 'Retired - No Pension' }
      ],
      required: true
    },
    {
      name: 'parentsSourceOfIncome',
      label: "Parent's source of income",
      type: 'select',
      options: [
        { value: '', label: "Select Parents' Source of Income" },
        { value: 'Pension - Government / Or retirement planning', 
          label: 'Pension - Govt / Retirement Planning' },
        { value: 'Currently Working - Govt', 
          label: 'Currently Working - Govt' },
        { value: 'Currently Working - Private', 
          label: 'Currently Working - Private' },
        { value: 'No Pension, lacked retirement planning', 
          label: 'No Pension, Lacked Planning' },
        { value: 'Not Applicable (Parents not alive)', 
          label: 'Not Applicable (Parents not alive)' }
      ],
      required: true
    },
    {
      name: 'currencyType',
      label: 'What Currency would you like to share primary numbers in?',
      type: 'select',
      options: [
        { value: '', label: 'Select Currency' },
        { value: 'Indian Rupee (INR)', label: 'Indian Rupee (INR)' },
        { value: 'United States Dollar (USD)', label: 'United States Dollar (USD)' },
        { value: 'Great Britain Pound (GBP)', label: 'Great Britain Pound (GBP)' },
        { value: 'Euros (EUR)', label: 'Euros (EUR)' }
      ]
    },
    {
      name: 'currentMonthlyIncome',
      label: 'What is your current monthly income?',
      type: 'number',
      note: '(Please mention INR 5L as 500000)',
      placeholder: 'Monthly Income',
      required: true
    },
    {
      name: 'currentMonthlyExpenses',
      label: 'What is your current monthly expenses?',
      type: 'number',
      note: '(Please mention INR 2L as 200000)',
      placeholder: 'Monthly Expenses',
      required: true
    },
    {
      name: 'totalInvestment',
      label: 'What is the approx. sum of your overall investment (total of EPF/Mutual Funds/PPF, FD etc)?',
      type: 'number',
      note: '(Please mention INR 10L as 1000000)',
      placeholder: 'Total Investment',
      required: true
    },
    {
      name: 'totalEmis',
      label: 'What is the sum total of all your EMIs (monthly numbers)?',
      type: 'number',
      note: '(Please mention INR 5L as 500000)',
      placeholder: 'Total EMIs',
      required: true
    },
    {
      name: 'investmentHorizon',
      label: 'What is your investment horizon, i.e., how long can you keep your money invested in the market before needing access to it?',
      type: 'select',
      options: [
        { value: '', label: 'Investment Horizon' },
        { value: 'Upto 2 years', label: 'Upto 2 years' },
        { value: '2-3 years', label: '2-3 years' },
        { value: '3-5 years', label: '3-5 years' },
        { value: '5-10 years', label: '5-10 years' },
        { value: '10+ years', label: '10+ years' }
      ],
      required: true
    },
    {
      name: 'equityMarketKnowledge',
      label: 'How well do you understand investing in the equity markets?',
      type: 'select',
      options: [
        { value: '', label: '-- Select --' },
        { value: 'I am a novice. I don\u2019t understand the markets at all', 
          label: 'I am a novice. I don\u2019t understand the markets at all' },
        { value: 'I have basic understanding of investing. I understand the risks and basic investment', 
          label: 'I have basic understanding of investing. I understand the risks and basic investment' },
        { value: 'I have an amateur interest in investing. I have invested earlier on my own. I understand how markets fluctuate and the pros and cons of different investment classes.', 
          label: 'I have an amateur interest in investing. I have invested earlier on my own. I understand how markets fluctuate and the pros and cons of different investment classes.' },
        { value: 'I am an experienced investor. I have invested in different markets and understand different investment strategies. I have my own investment philosophy.', 
          label: 'I am an experienced investor. I have invested in different markets and understand different investment strategies. I have my own investment philosophy.' }
      ],
      required: true
    },
    {
      name: 'incomeNature',
      label: 'Nature of your current and future income sources are:',
      note: '*(example: salary, business income, investment income, etc)',
      type: 'select',
      options: [
        { value: '', label: '-- Select --' },
        { value: 'Very unstable', label: 'Very unstable' },
        { value: 'Unstable', label: 'Unstable' },
        { value: 'Somewhat stable', label: 'Somewhat stable' },
        { value: 'Stable', label: 'Stable' },
        { value: 'Very Stable', label: 'Very Stable' }
      ],
      required: true
    },
    {
      name: 'investmentObjective',
      label: 'From the following 5 possible investment scenarios, please select the option that defines your investment objective.',
      type: 'select',
      options: [
        { value: '', label: '-- Select --' },
        { value: 'I cannot consider any Loss', label: 'I cannot consider any Loss' },
        { value: 'I can consider Loss of 4% if the possible Gains are of 10%', 
          label: 'I can consider Loss of 4% if the possible Gains are of 10%' },
        { value: 'I can consider Loss of 8% if the possible Gains are of 22%', 
          label: 'I can consider Loss of 8% if the possible Gains are of 22%' },
        { value: 'I can consider Loss of 14% if the possible Gains are of 30%', 
          label: 'I can consider Loss of 14% if the possible Gains are of 30%' },
        { value: 'I can consider Loss of 25% if the possible Gains are of 50%', 
          label: 'I can consider Loss of 25% if the possible Gains are of 50%' }
      ],
      required: true
    },
    {
      name: 'holdingPeriodForLoss',
      label: 'If your investment outlook is long-term (more than five years), how long will you hold on to a poorly performing portfolio before cashing in?',
      type: 'select',
      options: [
        { value: '', label: '-- Select --' },
        { value: 'Will not hold & cash in immediately if there is an erosion of my capital', 
          label: 'Will not hold & cash in immediately' },
        { value: 'I\u2019d hold for 3 months', label: 'I\u2019d hold for 3 months' },
        { value: 'I\u2019d hold for 6 months', label: 'I\u2019d hold for 6 months' },
        { value: 'I\u2019d hold for one year', label: 'I\u2019d hold for one year' },
        { value: 'I\u2019d hold for up to two years', label: 'I\u2019d hold for up to two years' },
        { value: 'I\u2019d hold for more than two years.', label: 'I\u2019d hold for more than two years' }
      ],
      required: true
    },
    {
      name: 'reactionToDecline',
      label: 'If a few months after investing, the value of your investments declines by 20%, what would you do?',
      type: 'select',
      options: [
        { value: '', label: '-- Select --' },
        { value: 'Cut losses immediately and liquidate all investments. Capital preservation is paramount.', 
          label: 'Cut losses immediately and liquidate all investments. Capital preservation is paramount.' },
        { value: 'Cut your losses and transfer investments to safer asset classes.', 
          label: 'Cut your losses and transfer investments to safer asset classes.' },
        { value: 'You would be worried, but would give your investments a little more time.', 
          label: 'You would be worried, but would give your investments a little more time.' },
        { value: 'You are ok with volatility and accept decline in portfolio value as a part of investing. You would keep your investments as they are', 
          label: 'You are ok with volatility and accept decline in portfolio value as a part of investing. You would keep your investments as they are' },
        { value: 'You would add to your investments to bring the average buying price lower. You are confident about your investments and are not perturbed by notional losses.', 
          label: 'You would add to your investments to bring the average buying price lower. You are confident about your investments and are not perturbed by notional losses.' }
      ],
      required: true
    }
  ];



  const [agreementSigned, setAgreementSigned] = useState(false);
  const [kycDetails, setKycDetails] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');

  // Handle navigation to next step
  const handleNextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  // Handle navigation to previous step
  const handlePrevStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  // Handle changes to risk profile form inputs
  const handleRiskProfileChange = (e) => {
    const { name, value } = e.target;
    setRiskProfile(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle risk profile submission
  const handleRiskProfileSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem('token'); // or however you store the JWT token
  
      const response = await axios.post(
        `${url}/client/addRiskData`,
        riskProfile, // assuming `riskProfile` is your form state
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      alert(response.data.msg); // success message
    } catch (err) {
      console.error('Submission error:', err);
      alert(err.response?.data?.msg || 'Something went wrong.');
    }
    handleNextStep();
  };

  // Handle KYC submission
  /*const handleKycSubmit = (e) => {
    e.preventDefault();
    console.log('KYC Details:', kycDetails);
    handleNextStep();
  };*/

  // Handle payment submission
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    console.log('Payment Details:', paymentDetails);
    handleNextStep();
  };

  // Handle agreement sign
  const handleAgreementSubmit = (e) => {
    e.preventDefault();
    console.log('Agreement Signed:', agreementSigned);
    handleNextStep();
  };

  // Enhanced change handler
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Special handling for PAN number
    if (name === 'panNumber') {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }
    
    setRiskProfile(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleNextField = (e) => {
    if (currentFieldIndex < riskProfileFields.length - 1) {
      setCurrentFieldIndex(currentFieldIndex + 1);
    } else {
      // When all fields are done, proceed to next step
      handleRiskProfileSubmit(e);
    }
  };

  const handlePrevField = () => {
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex(currentFieldIndex - 1);
    }
  };

  const [aadhaarFile, setAadhaarFile] = useState(null);
const [panFile, setPanFile] = useState(null);

const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    console.log('Selected file:', e.target.files[0]);
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('aadhaar', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${url}/client/aadhaar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      alert(`Upload successful: ${response.data.message}`);
      setMessage(response.data.message);
      setError('');
      setFile(null); // reset file after upload
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
      setMessage('');
      setError(err.response?.data?.error || 'Upload failed');
    }
  };

  const [filePAN, setFilePAN] = useState(null);
  const [messagePAN, setMessagePAN] = useState('');
  const [errorPAN, setErrorPAN] = useState('');

  const handleFileChangePAN = (e) => {
    console.log('Selected file:', e.target.files[0]);
    setFilePAN(e.target.files[0]);
  };

  const handleUploadPAN = async (e) => {
    e.preventDefault();

    if (!filePAN) {
      setErrorPAN('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('pan', filePAN);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${url}/client/pan`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      alert(`Upload successful: ${response.data.message}`);
      setMessagePAN(response.data.message);
      setErrorPAN('');
      setFile(null); // reset file after upload
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
      setMessagePAN('');
      setErrorPAN(err.response?.data?.error || 'Upload failed');
    }
  };



   const [loadingSign, setLoadingSign] = useState(false);
  const [errorSign, setErrorSign] = useState(null);
  const [successSign, setSuccessSign] = useState(false);
  const digioLoaded = useDigio();

  const handleSubmitSign = async (e) => {
    e.preventDefault();
    setLoadingSign(true);
    setErrorSign(null);
    setSuccessSign(false);

    if (!digioLoaded) {
      setErrorSign("Digio service is still loading. Please try again.");
      return;
    }

    try {
      // Initialize Digio
      const digioOptions = {
        environment: "sandbox",
        callback: (response) => {
          console.log("Digio Callback Response:", response);
          if (response.hasOwnProperty("error_code")) {
            setErrorSign("Error during signing.");
          } else {
            setSuccessSign(true);

            handleNextStep();
          }
        },
        logo: "https://www.jockey.in/cdn/shop/files/Jockey_logo.webp?width=666",
        is_redirection_approach: false,
        //redirect_url: window.location.origin + "/uploadPan",
        theme: {
          primaryColor: "#5A2989",
          secondaryColor: "#669698",
          fontFamily: 'Barlow',
          fontUrl: 'https://fonts.googleapis.com/css?family=Barlow'
        }
      };

      // Call backend to generate and upload document
      const response = await axios.post(`${url}/client/upload-document`);
      
      if (response.data) {
        const digio = new window.Digio(digioOptions);
        digio.init();
        
        const identifier = response.data.signing_parties?.[0]?.identifier;
        const digioDocumentId = response.data.id;
        
        digio.submit(digioDocumentId, identifier);
      }
    } catch (err) {
      console.error(err);
      setErrorSign(err.response?.data?.error || "An error occurred while generating the contract.");
    } finally {
      setLoadingSign(false);
    }
  };

  // Render current field based on step
  const currentField = riskProfileFields[currentFieldIndex];
  const renderCurrentField = () => {
    if (currentStep === 1) { // Risk Profile Step
      return(
        <div className="form-group">
          <label htmlFor={currentField.name}>{currentField.label}</label>
          {currentField.note && <small className="form-note">{currentField.note}</small>}
          
          {currentField.type === 'select' ? (
            <select
              id={currentField.name}
              name={currentField.name}
              value={riskProfile[currentField.name] || ''}
              onChange={handleFieldChange}
              required={currentField.required}
            >
              {currentField.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={currentField.type}
              id={currentField.name}
              name={currentField.name}
              value={riskProfile[currentField.name] || ''}
              onChange={handleFieldChange}
              placeholder={currentField.placeholder}
              required={currentField.required}
              //pattern={currentField.pattern}
              maxLength={currentField.maxLength}
              min={currentField.min}
              style={currentField.name === 'panNumber' ? { textTransform: 'uppercase' } : {}}
            />
          )}
        </div>
      );
    } else if (currentStep === 2) { // Agreement Step
      return (
        <div className="onboarding-step">
      <h2>Generate Your Contract</h2>
     
        <button type="button" disabled={loadingSign} onClick={handleSubmitSign}>
          {loadingSign ? 'Preparing Contract...' : 'Prepare Contract'}
        </button>
      

      {errorSign && <div style={{ color: 'red' }}>{errorSign}</div>}
      {successSign && <div>Document signed successfully!</div>}
    </div>
  );
      
    }
    else if (currentStep === 3) { 
    // ... other steps ...
  
      // In your render/return:
      return (
        <div className="onboarding-step">
           <h3>Step 3: KYC (Know Your Customer)</h3>
      <h2>Upload Aadhaar Document</h2>
      
      <div>
  <input type="file" onChange={handleFileChange} />
  <button type="button" onClick={handleUpload}>Upload</button>
</div>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="step-navigation">
        <button type="button" onClick={handlePrevStep}>
          Back
        </button>
        <button type="button" onClick={handleNextStep} disabled={!file}>
          Next
        </button>
      </div>
        </div>
      );
    }
    else if (currentStep === 4) { 
      // ... other steps ...
    
        // In your render/return:
        return (
          <div className="onboarding-step">
             <h3>Step 3: KYC (Know Your Customer)</h3>
        <h2>Upload PAN Document</h2>
        
        <div>
    <input type="file" onChange={handleFileChangePAN} />
    <button type="button" onClick={handleUploadPAN}>Upload</button>
  </div>
  
        {messagePAN && <p style={{ color: 'green' }}>{messagePAN}</p>}
        {errorPAN && <p style={{ color: 'red' }}>{errorPAN}</p>}
  
        <div className="step-navigation">
          <button type="button" onClick={handlePrevStep}>
            Back
          </button>
          <button type="button" onClick={handleNextStep} disabled={!filePAN}>
            Next
          </button>
        </div>
          </div>
        );
      }

    else if(currentStep === 5){
      return(
      <div className="onboarding-step">
      <h3>Step 4: Payment</h3>
      <form onSubmit={handlePaymentSubmit}>
        <input
          type="text"
          value={paymentDetails}
          onChange={(e) => setPaymentDetails(e.target.value)}
          placeholder="Enter payment details"
          required
        />
        <button type="submit" className="btn-submit">Submit Payment</button>
      </form>
      <div className="step-navigation">
        <button onClick={handlePrevStep}>Back</button>
        <button onClick={handleNextStep}>Next</button>
      </div>
    </div>
      );
    }
    /*else{
      return(
      <div className="onboarding-complete">
      <h3>Onboarding Complete!</h3>
      <p>Thank you for completing your onboarding process. You can now access your dashboard.</p>
    </div>
      );
    }*/
   else{
  return(  <a
  href={`${url}/client/aadhaar/download`}
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => {
    const token = localStorage.getItem('token');
    // Temporarily attach token to URL using a dynamic link
    const authWindow = window.open();
    fetch(`${url}/client/aadhaar/download`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => response.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'aadhaar_document.pdf'; // Optional: default filename
        a.click();
        a.remove();
      })
      .catch((err) => {
        alert('Failed to download file');
        console.error(err);
      });

    return false; // Prevent default <a> behavior
  }}
>
  Download Aadhaar Document
</a>)

   }
   
  };


  return (
    

    <div className="client-layout-container">
    <h2>Client Onboarding</h2>
    
    {/* Progress indicator */}
    <div className="progress-indicator">
      Step {currentStep} of 4 • Field {currentFieldIndex + 1} of {riskProfileFields.length}
    </div>

    {/* Current step content */}
    <div className="onboarding-step">
      {currentStep === 1 && <h3>Step 1: Risk Profile Data Submission</h3>}
      {currentStep === 2 && <h3>Step 2: Agreement Sign</h3>}
      {currentStep === 3 && <h3>Step 3: Upload Adhaar and PAN for KYC</h3>}
      {currentStep === 4 && <h3>Step 4: Complete Payment</h3>}

      {/* ... other step headers ... */}

      <form onSubmit={(e) => {
        e.preventDefault();
        if (currentStep === 1 ) handleNextField(e);
        else handleNextStep();
      }}>
        {renderCurrentField()}
        
        <div className="step-navigation">
          <button 
            type="button" 
            onClick={currentStep === 1 ? handlePrevField : handlePrevStep}
            disabled={currentStep === 1 && currentFieldIndex === 0}
          >
            Back
          </button>
          <button type="submit">
            {currentStep === 1 && currentFieldIndex === riskProfileFields.length - 1 
              ? 'Submit Risk Profile' 
              : currentStep === 4 
                ? 'Complete Onboarding' 
                : 'Next'}
          </button>
        </div>
      </form>
    </div>
  </div>
  );
};

export default ClientLayout;
