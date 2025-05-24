import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ClientRiskProfile = () => {
  axios.defaults.withCredentials = true;
  const url = import.meta.env.VITE_URL;
  const { clientId } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Refs for each field
  const fullNameRef = useRef();
  const panNumberRef = useRef();
  const addressLine1Ref = useRef();
  const addressLine2Ref = useRef();
  const phoneNumberRef = useRef();
  const emailAddressRef = useRef();
  const genderRef = useRef();
  const maritalStatusRef = useRef();
  const dateOfBirthRef = useRef();
  const sonsRef = useRef();
  const daughtersRef = useRef();
  const dependentParentsRef = useRef();
  const dependentSiblingsRef = useRef();
  const dependentParentsInLawRef = useRef();
  const sourceOfIncomeRef = useRef();
  const parentsSourceOfIncomeRef = useRef();
  const currencyTypeRef = useRef();
  const currentMonthlyIncomeRef = useRef();
  const currentMonthlyExpensesRef = useRef();
  const totalInvestmentRef = useRef();
  const totalEmisRef = useRef();
  const investmentHorizonRef = useRef();
  const equityMarketKnowledgeRef = useRef();
  const incomeNatureRef = useRef();
  const investmentObjectiveRef = useRef();
  const holdingPeriodForLossRef = useRef();
  const reactionToDeclineRef = useRef();

  useEffect(() => {
    const controller = new AbortController();

    const fetchRiskProfile = async () => {
      try {
        const res = await axios.get(`${url}/admin/clients/${clientId}/riskProfile`, { signal: controller.signal });
        const data = res.data.data;

        const formatDate = (isoDate) => {
          if (!isoDate) return "";
          const date = new Date(isoDate);
          return date.toISOString().split("T")[0];
        };

        setFormData({
          ...data,
          dateOfBirth: formatDate(data.dateOfBirth)
        });
      } catch (error) {
        console.error("Error fetching risk profile:", error);
      }
    };

    fetchRiskProfile();

    return () => controller.abort();
  }, [clientId]);

  const getValueOrNull = (ref) => {
    const value = ref.current?.value?.trim();
    return value === "" ? null : value;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updatedData = {
      fullName: getValueOrNull(fullNameRef),
      panNumber: getValueOrNull(panNumberRef),
      addressLine1: getValueOrNull(addressLine1Ref),
      addressLine2: getValueOrNull(addressLine2Ref),
      phoneNumber: getValueOrNull(phoneNumberRef),
      emailAddress: getValueOrNull(emailAddressRef),
      gender: getValueOrNull(genderRef),
      maritalStatus: getValueOrNull(maritalStatusRef),
      dateOfBirth: getValueOrNull(dateOfBirthRef),
      sons: Number(getValueOrNull(sonsRef)),
      daughters: Number(getValueOrNull(daughtersRef)),
      dependentParents: Number(getValueOrNull(dependentParentsRef)),
      dependentSiblings: Number(getValueOrNull(dependentSiblingsRef)),
      dependentParentsInLaw: Number(getValueOrNull(dependentParentsInLawRef)),
      sourceOfIncome: getValueOrNull(sourceOfIncomeRef),
      parentsSourceOfIncome: getValueOrNull(parentsSourceOfIncomeRef),
      currencyType: getValueOrNull(currencyTypeRef),
      currentMonthlyIncome: Number(getValueOrNull(currentMonthlyIncomeRef)),
      currentMonthlyExpenses: Number(getValueOrNull(currentMonthlyExpensesRef)),
      totalInvestment: Number(getValueOrNull(totalInvestmentRef)),
      totalEmis: Number(getValueOrNull(totalEmisRef)),
      investmentHorizon: getValueOrNull(investmentHorizonRef),
      equityMarketKnowledge: getValueOrNull(equityMarketKnowledgeRef),
      incomeNature: getValueOrNull(incomeNatureRef),
      investmentObjective: getValueOrNull(investmentObjectiveRef),
      holdingPeriodForLoss: getValueOrNull(holdingPeriodForLossRef),
      reactionToDecline: getValueOrNull(reactionToDeclineRef),
    };

    try {
      await axios.patch(`${url}/admin/clients/${id}/riskProfile`, updatedData);
      alert("Risk Profile updated successfully!");
    } catch (error) {
      console.error("Error updating risk profile:", error);
      alert("Failed to update risk profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return <p>Loading Risk Profile...</p>;

  return (
    <form  className="container my-4">
      <div className="card p-4 shadow">
        <h2 className="mb-3">Edit Risk Profile</h2>

        {/* Example field */}
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-control" ref={fullNameRef} defaultValue={formData.fullName} required />
        </div>

        {/* Repeat similar fields for all the other fields using refs and formData.defaultValue */}
        <div className="mb-3">
  <label className="form-label">PAN Number</label>
  <input type="text" className="form-control" ref={panNumberRef} defaultValue={formData.panNumber} />
</div>

<div className="mb-3">
  <label className="form-label">Address Line 1</label>
  <input type="text" className="form-control" ref={addressLine1Ref} defaultValue={formData.addressLine1} />
</div>

<div className="mb-3">
  <label className="form-label">Address Line 2</label>
  <input type="text" className="form-control" ref={addressLine2Ref} defaultValue={formData.addressLine2} />
</div>

<div className="mb-3">
  <label className="form-label">Phone Number</label>
  <input type="text" className="form-control" ref={phoneNumberRef} defaultValue={formData.phoneNumber} />
</div>

<div className="mb-3">
  <label className="form-label">Email Address</label>
  <input type="email" className="form-control" ref={emailAddressRef} defaultValue={formData.emailAddress} />
</div>

<div className="mb-3">
  <label className="form-label">Gender</label>
  <input type="text" className="form-control" ref={genderRef} defaultValue={formData.gender} />
</div>

<div className="mb-3">
  <label className="form-label">Marital Status</label>
  <input type="text" className="form-control" ref={maritalStatusRef} defaultValue={formData.maritalStatus} />
</div>

<div className="mb-3">
  <label className="form-label">Date of Birth</label>
  <input type="date" className="form-control" ref={dateOfBirthRef} defaultValue={formData.dateOfBirth} />
</div>

<div className="mb-3">
  <label className="form-label">Sons</label>
  <input type="number" className="form-control" ref={sonsRef} defaultValue={formData.sons} />
</div>

<div className="mb-3">
  <label className="form-label">Daughters</label>
  <input type="number" className="form-control" ref={daughtersRef} defaultValue={formData.daughters} />
</div>

<div className="mb-3">
  <label className="form-label">Dependent Parents</label>
  <input type="number" className="form-control" ref={dependentParentsRef} defaultValue={formData.dependentParents} />
</div>

<div className="mb-3">
  <label className="form-label">Dependent Siblings</label>
  <input type="number" className="form-control" ref={dependentSiblingsRef} defaultValue={formData.dependentSiblings} />
</div>

<div className="mb-3">
  <label className="form-label">Dependent Parents-In-Law</label>
  <input type="number" className="form-control" ref={dependentParentsInLawRef} defaultValue={formData.dependentParentsInLaw} />
</div>

<div className="mb-3">
  <label className="form-label">Source of Income</label>
  <textarea className="form-control" ref={sourceOfIncomeRef} defaultValue={formData.sourceOfIncome} />
</div>

<div className="mb-3">
  <label className="form-label">Parents' Source of Income</label>
  <textarea className="form-control" ref={parentsSourceOfIncomeRef} defaultValue={formData.parentsSourceOfIncome} />
</div>

<div className="mb-3">
  <label className="form-label">Currency Type</label>
  <input type="text" className="form-control" ref={currencyTypeRef} defaultValue={formData.currencyType} />
</div>

<div className="mb-3">
  <label className="form-label">Current Monthly Income</label>
  <input type="number" className="form-control" ref={currentMonthlyIncomeRef} defaultValue={formData.currentMonthlyIncome} />
</div>

<div className="mb-3">
  <label className="form-label">Current Monthly Expenses</label>
  <input type="number" className="form-control" ref={currentMonthlyExpensesRef} defaultValue={formData.currentMonthlyExpenses} />
</div>

<div className="mb-3">
  <label className="form-label">Total Investment</label>
  <input type="number" className="form-control" ref={totalInvestmentRef} defaultValue={formData.totalInvestment} />
</div>

<div className="mb-3">
  <label className="form-label">Total EMIs</label>
  <input type="number" className="form-control" ref={totalEmisRef} defaultValue={formData.totalEmis} />
</div>

<div className="mb-3">
  <label className="form-label">Investment Horizon</label>
  <input type="text" className="form-control" ref={investmentHorizonRef} defaultValue={formData.investmentHorizon} />
</div>

<div className="mb-3">
  <label className="form-label">Equity Market Knowledge</label>
  <textarea className="form-control" ref={equityMarketKnowledgeRef} defaultValue={formData.equityMarketKnowledge} />
</div>

<div className="mb-3">
  <label className="form-label">Income Nature</label>
  <input type="text" className="form-control" ref={incomeNatureRef} defaultValue={formData.incomeNature} />
</div>

<div className="mb-3">
  <label className="form-label">Investment Objective</label>
  <textarea className="form-control" ref={investmentObjectiveRef} defaultValue={formData.investmentObjective} />
</div>

<div className="mb-3">
  <label className="form-label">Holding Period for Loss</label>
  <input type="text" className="form-control" ref={holdingPeriodForLossRef} defaultValue={formData.holdingPeriodForLoss} />
</div>

<div className="mb-3">
  <label className="form-label">Reaction to Market Decline</label>
  <textarea className="form-control" ref={reactionToDeclineRef} defaultValue={formData.reactionToDecline} />
</div>


      {/* <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Save Risk Profile"}
        </button>*/}
      </div>
    </form>
  );
};

export default ClientRiskProfile;
