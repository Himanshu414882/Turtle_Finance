import React, { useState } from "react";
import axios from "axios";

const UpdateSubscriptionPlan = () => {
  const [planName, setPlanName] = useState("Indian");
  const [priceRupees, setPriceRupees] = useState("");
  const [priceDollar, setPriceDollar] = useState("");
  const [loading, setLoading] = useState(false);

  const url = import.meta.env.VITE_URL; // your base API URL

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic front-end validation
    if (!priceRupees) {
      alert("Price in Rupees is required");
      return;
    }
    if (planName === "NRI" && !priceDollar) {
      alert("Price in Dollar is required for NRI plan");
      return;
    }

    setLoading(true);

    try {
      await axios.put(
        `${url}/admin/updatePlanByName/${planName}`,
        {
          priceRupees: Number(priceRupees),
          priceDollar: planName === "NRI" ? Number(priceDollar) : undefined,
        },
        { withCredentials: true }
      );
      alert(`Plan '${planName}' updated successfully!`);
      // Reset or do something after success if needed
    } catch (error) {
      console.error("Error updating plan:", error.response || error);
      alert("Failed to update plan. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-4">
      <div className="card shadow p-4">
        <h2 className="mb-4">Update Subscription Plan Price</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Select Plan</label>
            <div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  id="planIndian"
                  name="planName"
                  value="Indian"
                  checked={planName === "Indian"}
                  onChange={() => setPlanName("Indian")}
                  className="form-check-input"
                />
                <label htmlFor="planIndian" className="form-check-label">
                  Indian
                </label>
              </div>

              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  id="planNRI"
                  name="planName"
                  value="NRI"
                  checked={planName === "NRI"}
                  onChange={() => setPlanName("NRI")}
                  className="form-check-input"
                />
                <label htmlFor="planNRI" className="form-check-label">
                  NRI
                </label>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="priceRupees" className="form-label">
              Price in Rupees
            </label>
            <input
              type="number"
              id="priceRupees"
              className="form-control"
              value={priceRupees}
              onChange={(e) => setPriceRupees(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </div>

          {planName === "NRI" && (
            <div className="mb-3">
              <label htmlFor="priceDollar" className="form-label">
                Price in Dollar
              </label>
              <input
                type="number"
                id="priceDollar"
                className="form-control"
                value={priceDollar}
                onChange={(e) => setPriceDollar(e.target.value)}
                required
                min="0"
                step="0.01"
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Updating..." : "Update Plan"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateSubscriptionPlan;
