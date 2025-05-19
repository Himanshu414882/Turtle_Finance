import React, { Fragment, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddUser = () => {
    axios.defaults.withCredentials = true;
    const url = import.meta.env.VITE_URL;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState("admin"); // To conditionally show clientType

    // Refs for inputs
    const nameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const roleRef = useRef();
    const clientTypeRef = useRef();

    const getValueOrNull = (ref) => {
        const value = ref.current?.value?.trim();
        return value === "" ? null : value;
    };

    const handleRoleChange = (e) => {
        setRole(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const newUser = {
            name: getValueOrNull(nameRef),
            email: getValueOrNull(emailRef),
            password: getValueOrNull(passwordRef),
            role: getValueOrNull(roleRef),
        };

        if (newUser.role === "client") {
            newUser.clientType = getValueOrNull(clientTypeRef);
        }

        try {
            await axios.post(`${url}/auth/register`, newUser);
            alert("User registered successfully!");
            navigate("/adminautharized/admin/users");
        } catch (error) {
            console.error("Error adding user:", error);
            alert("Failed to register user.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <div className="container my-4">
                <div className="card shadow p-4">
                    <h2 className="mb-4">Add User</h2>
                    <form onSubmit={handleSubmit}>

                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label">Name</label>
                                <input type="text" className="form-control" ref={nameRef} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-control" ref={emailRef} required />
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label">Password</label>
                                <input type="password" className="form-control" ref={passwordRef} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Role</label>
                                <select
                                    className="form-select"
                                    ref={roleRef}
                                    defaultValue="admin"
                                    onChange={handleRoleChange}
                                    required
                                >
                                    <option value="admin">Admin</option>
                                    <option value="advisor">Advisor</option>
                                    <option value="client">Client</option>
                                </select>
                            </div>
                        </div>

                        {role === "client" && (
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Client Type</label>
                                    <select className="form-select" ref={clientTypeRef} required>
                                        <option value="">Select</option>
                                        <option value="Indian">Indian</option>
                                        <option value="NRI">NRI</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="d-flex justify-content-end">
                            <button type="submit" className="btn btn-turtle-primary" disabled={loading}>
                                {loading ? "Registering..." : "Add User"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Fragment>
    );
};

export default AddUser;
