import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const PublicPatientProfilePage = () => {
    const { id } = useParams();
    const [publicData, setPublicData] = useState(null);
    const [privateData, setPrivateData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDoctor, setIsDoctor] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const publicRes = await axios.get(`/api/patients/public/${id}`);
                setPublicData(publicRes.data);

                const token = localStorage.getItem('token');
                if (token) {
                    const decoded = jwtDecode(token);
                    if (decoded.user.role === 'doctor' && decoded.exp * 1000 > Date.now()) {
                        setIsDoctor(true);
                        const privateRes = await axios.get(`/api/patients/${id}`);
                        setPrivateData(privateRes.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching patient data:", error);
            }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="page-container"><p>Loading Patient Profile...</p></div>;
    if (!publicData) return <div className="page-container"><h2>Error</h2><p>Patient not found.</p></div>;

    const patient = privateData || publicData;

    return (
        <div className="page-container">
            <h2>Patient Profile</h2>
            <div className="patient-info">
                <p><strong>Name:</strong> {patient.name}</p>
                <p><strong>Sex:</strong> {patient.sex}</p>
                <p><strong>Blood Group:</strong> {patient.bloodGroup}</p>
                <p><strong>Diabetic:</strong> {patient.isDiabetic ? 'Yes' : 'No'}</p>
                <p><strong>Thyroid Condition:</strong> {patient.hasThyroid ? 'Yes' : 'No'}</p>
                <p><strong>Allergies:</strong> {patient.allergies || 'None specified'}</p>

                {isDoctor && privateData ? (
                    <>
                        <hr/>
                        <h3>Full Medical Record (Doctor Access)</h3>
                        <p><strong>Surname:</strong> {privateData.surname}</p>
                        <p><strong>Email:</strong> {privateData.email}</p>
                        <p><strong>Phone:</strong> {privateData.phoneNumber}</p>
                        <p><strong>Emergency Contact:</strong> {privateData.emergencyContact}</p>
                    </>
                ) : (
                    <div className="login-prompt">
                        <hr/>
                        <p>You are viewing limited, public information.</p>
                        <Link to="/login-doctor" state={{ from: location.pathname }} className="btn btn-primary">Doctor Login to View Full Record</Link>
                    </div>
                )}
            </div>

            {isDoctor && privateData && (
                <>
                    <hr />
                    <h3>Uploaded Files</h3>
                    <div className="file-list">
                        {privateData.files && privateData.files.length > 0 ? (
                            privateData.files.map(f => {
                                const isPdf = f.fileName.toLowerCase().endsWith('.pdf');
                                const fileUrl = isPdf ? `https://docs.google.com/gview?url=${f.url}&embedded=true` : f.url;
                                return ( <div key={f._id} className="file-item"><a href={fileUrl} target="_blank" rel="noopener noreferrer">{f.fileName}</a><span>Uploaded on: {new Date(f.uploadedAt).toLocaleDateString()}</span></div> );
                            })
                        ) : ( <p>No files uploaded for this patient.</p> )}
                    </div>
                </>
            )}
        </div>
    );
};

export default PublicPatientProfilePage;