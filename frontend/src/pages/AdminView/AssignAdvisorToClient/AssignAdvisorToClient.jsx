import React, { useEffect, useState } from "react";
import axios from "axios";

const AssignAdvisorToClient = () => {
  axios.defaults.withCredentials = true;
  const url = import.meta.env.VITE_URL;
  const [clients, setClients] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [domains] = useState([
    "Financial Planner",
    "Tax Specialist",
    "Insurance Consultant",
    "Estate Planner",
    "Credit Card Advisor"
  ]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedAdvisor, setSelectedAdvisor] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [clientsRes, advisorsRes] = await Promise.all([
          axios.get(`${url}/admin/clients`),
          axios.get(`${url}/admin/advisors`)
        ]);
        
        setClients(clientsRes.data);
        
        // Verify advisors data structure
        console.log("Advisors data:", advisorsRes.data);
        if (!advisorsRes.data.every(advisor => 'domain' in advisor)) {
          console.warn("Some advisors are missing domain field");
        }
        
        setAdvisors(advisorsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  // Filter advisors based on selected domain
  const filteredAdvisors = selectedDomain
    ? advisors.filter(advisor => 
        advisor.advisorDomain && 
        advisor.advisorDomain.trim().toLowerCase() === selectedDomain.trim().toLowerCase()
      )
    : advisors;

  const handleAssign = async () => {
    if (!selectedClient || !selectedAdvisor) {
      alert("Please select both client and advisor");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${url}/admin/clients/${selectedClient}/assign-advisor`, 
        { advisorId: selectedAdvisor }
      );
      alert(res.data.message || "Advisor assigned successfully!");
      setSelectedClient("");
      setSelectedAdvisor("");
      setSelectedDomain("");
    } catch (err) {
      console.error("Error assigning advisor:", err);
      alert(err.response?.data?.message || "Failed to assign advisor.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "20px", textAlign: "center" }}>Loading data...</div>;
  if (error) return <div style={{ padding: "20px", color: "red", textAlign: "center" }}>{error}</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Assign Advisor to Client</h2>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Client:</label>
        <select 
          value={selectedClient} 
          onChange={(e) => setSelectedClient(e.target.value)}
          disabled={loading}
          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="">Select Client</option>
          {clients.map((client) => (
            <option key={client._id} value={client._id}>
              {client.fullName}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Domain:</label>
        <select
          value={selectedDomain}
          onChange={(e) => {
            setSelectedDomain(e.target.value);
            setSelectedAdvisor("");
          }}
          disabled={loading}
          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="">All Domains</option>
          {domains.map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Advisor:</label>
        <select 
          value={selectedAdvisor} 
          onChange={(e) => setSelectedAdvisor(e.target.value)}
          disabled={loading || !selectedDomain}
          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="">{selectedDomain ? `Select ${selectedDomain}` : "Select Domain First"}</option>
          {filteredAdvisors.length > 0 ? (
            filteredAdvisors.map((advisor) => (
              <option key={advisor._id} value={advisor._id}>
                {advisor.advisorFullName} - {advisor.advisorDomain}
              </option>
            ))
          ) : (
            <option value="" disabled>
              {selectedDomain ? `No ${selectedDomain} available` : ""}
            </option>
          )}
        </select>
      </div>

      <button 
        onClick={handleAssign} 
        disabled={!selectedClient || !selectedAdvisor || loading}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: !selectedClient || !selectedAdvisor ? "#ccc" : "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "16px"
        }}
      >
        {loading ? "Assigning..." : "Assign Advisor"}
      </button>
    </div>
  );
};

export default AssignAdvisorToClient;