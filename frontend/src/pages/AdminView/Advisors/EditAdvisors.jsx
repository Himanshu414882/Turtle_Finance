import React, { Fragment, useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditAdvisors = () => {
    axios.defaults.withCredentials = true
    const url = import.meta.env.VITE_URL;
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(null);
     const [profilePicture, setProfilePicture] = useState(null);
    const [previewImage, setPreviewImage] = useState("");

    const fullNameRef = useRef();
    const salutationRef = useRef();
    const advisorDomainRef = useRef();
    const countryCodeRef = useRef();
    const phoneRef = useRef();
    const emailRef = useRef();
    const addressRef = useRef();
    const dobRef = useRef();
    const genderRef = useRef();

    const qualificationRef = useRef();
    const experienceRef = useRef();
    const credentialsRef = useRef();
    const bioRef = useRef();
     const fileInputRef = useRef();

    const fetchAdvisorData = async (signal) => {
        try {
            const response = await axios.get(`${url}/admin/advisors/${id}/editAdvisors`, { signal });
            const data = response.data;

            const formatDate = (isoDate) => {
                if (!isoDate) return "";
                const date = new Date(isoDate);
                return date.toISOString().split("T")[0];
            };

            setFormData({
                ...data,
                dob: formatDate(data.dob),
            });

            

            if (data.profilePictureId) {
    setPreviewImage(`${url}/files/${data.profilePictureId}`);
}


        } catch (error) {
            console.error("Error fetching advisor data:", error);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchAdvisorData(controller.signal);
        return () => controller.abort();
    }, [id]);


      const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const getValueOrNull = (ref) => {
        const value = ref.current?.value?.trim();
        return value === "" ? null : value;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

       const updatedData = new FormData();
updatedData.append('advisorFullName', getValueOrNull(fullNameRef));
updatedData.append('salutation', getValueOrNull(salutationRef));
updatedData.append('advisorDomain', getValueOrNull(advisorDomainRef));
updatedData.append('countryCode', getValueOrNull(countryCodeRef));
updatedData.append('phone', getValueOrNull(phoneRef));
updatedData.append('email', getValueOrNull(emailRef));
updatedData.append('address', getValueOrNull(addressRef));
updatedData.append('dob', getValueOrNull(dobRef));
updatedData.append('gender', getValueOrNull(genderRef));
updatedData.append('qualification', getValueOrNull(qualificationRef));
updatedData.append('experience', getValueOrNull(experienceRef));
updatedData.append('credentials', getValueOrNull(credentialsRef));
updatedData.append('bio', getValueOrNull(bioRef));

if (profilePicture) {
    updatedData.append('profilePicture', profilePicture);
}


        try {
            await axios.patch(`${url}/admin/advisors/${id}/editAdvisors`, updatedData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            alert("Advisor data updated successfully!");
            navigate("/adminautharized/admin/advisors");
        } catch (error) {
            console.log("Error updating advisor:", error);
            alert("Failed to update advisor. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!formData) return <p>Loading...</p>;

    return (
        <Fragment>
            <div className="container my-4">
                <div className="card shadow p-4">
                    <h2 className="mb-4">Edit Advisor</h2>
                    
                    <form onSubmit={handleSubmit}>

             {/* Profile Picture Upload */}
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <label className="form-label">Profile Picture</label>
                                <div className="d-flex align-items-center">
                                    {previewImage && (
                                        <img 
                                            src={previewImage} 
                                            alt="Profile Preview" 
                                            className="rounded-circle me-3"
                                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                        />
                                    )}
                                    <div>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="form-control"
                                            style={{ display: 'none' }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => fileInputRef.current.click()}
                                        >
                                            {profilePicture ? 'Change Image' : 'Upload Image'}
                                        </button>
                                        {profilePicture && (
                                            <button
                                                type="button"
                                                className="btn btn-link text-danger ms-2"
                                                onClick={() => {
  setProfilePicture(null);
  setPreviewImage(formData.profilePictureId?._id ?
  `${url}/files/${formData.profilePictureId._id}` : "");
  fileInputRef.current.value = "";
}}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <small className="text-muted">Max file size: 5MB (JPEG, PNG)</small>
                            </div>
                        </div>












                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label">Full Name</label>
                                <input type="text" className="form-control" ref={fullNameRef} defaultValue={formData.advisorFullName} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Salutation</label>
                                <input type="text" className="form-control" ref={salutationRef} defaultValue={formData.salutation} />
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label">Domain</label>
                                <input type="text" className="form-control" ref={advisorDomainRef} defaultValue={formData.advisorDomain} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Country Code</label>
                                <input type="text" className="form-control" ref={countryCodeRef} defaultValue={formData.countryCode} />
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label">Phone</label>
                                <input type="text" className="form-control" ref={phoneRef} defaultValue={formData.phone} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-control" ref={emailRef} defaultValue={formData.email} required />
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label">Address</label>
                                <input type="text" className="form-control" ref={addressRef} defaultValue={formData.address} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Date of Birth</label>
                                <input type="date" className="form-control" ref={dobRef} defaultValue={formData.dob} />
                            </div>
                        </div>

                        <div className="row mb-4">
                            <div className="col-md-6">
                                <label className="form-label">Gender</label>
                                <select className="form-select" ref={genderRef} defaultValue={formData.gender || ""}>
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>


                        <div className="row mb-3">
    <div className="col-md-6">
        <label className="form-label">Qualification</label>
        <input type="text" className="form-control" ref={qualificationRef} defaultValue={formData.qualification} />
    </div>
    <div className="col-md-6">
        <label className="form-label">Experience (in years)</label>
        <input type="number" className="form-control" ref={experienceRef} defaultValue={formData.experience} />
    </div>
</div>

<div className="row mb-3">
    <div className="col-md-6">
        <label className="form-label">Credentials</label>
        <input type="text" className="form-control" ref={credentialsRef} defaultValue={formData.credentials} />
    </div>
</div>

<div className="mb-4">
    <label className="form-label">Advisor Bio</label>
    <textarea className="form-control" ref={bioRef} defaultValue={formData.bio} rows="5" />
</div>

                        <div className="d-flex justify-content-end">
                            <button type="submit" className="btn btn-turtle-primary" disabled={loading}>
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Fragment>
    );
};

export default EditAdvisors;
