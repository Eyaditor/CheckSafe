import React, { useState } from 'react';
import axios from 'axios';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import '../components/style/Emailchecker.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EmailCheckPage = () => {
    const [email, setEmail] = useState('');
    const [breaches, setBreaches] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    console.log('BACKEND_URL:', BACKEND_URL);

    const handleCheck = async () => {
        const url = `${BACKEND_URL}/check-email/?email=${email}`;
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(url);

            if (Array.isArray(response.data)) {
                setBreaches(response.data);
                await storeEmailCheckResults(email, response.data);
            } else if (response.data.message) {
                setBreaches(response.data.message);
                await storeEmailCheckResults(email, []);
            } else {
                setBreaches("Unexpected response format.");
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setBreaches("Email not found in HIBP.");
                await storeEmailCheckResults(email, []);
            } else {
                console.error('Error checking email:', error);
                setError("An error occurred while checking the email.");
            }
        } finally {
            setLoading(false);
        }
    };

    const storeEmailCheckResults = async (email, breachResults) => {
        try {
            const auth = getAuth();
            const userId = auth.currentUser ? auth.currentUser.uid : 'anonymous';

            await addDoc(collection(db, "emailChecks"), {
                email,
                breaches: breachResults,
                breachCount: breachResults.length,
                timeStamp: Timestamp.fromDate(new Date()),
                userId,
            });
        } catch (error) {
            console.error("Error storing email check results in Firestore:", error);
        }
    };

    return (
        <div className="email-check-container">
            <h1>Email Breach Check</h1>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="email-input"
            />
            <button onClick={handleCheck} disabled={loading} className="check-button">
                {loading ? "Checking..." : "Check Email"}
            </button>

            {error && <p className="error-message">{error}</p>}

            {breaches !== null && (
                <div className="breaches-container">
                    {typeof breaches === 'string' ? (
                        <p>{breaches}</p>
                    ) : breaches.length === 0 ? (
                        <p>No breaches found.</p>
                    ) : (
                        <ul className="breaches-list">
                            {breaches.map((breach, index) => (
                                <li key={index}>{breach.Name}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmailCheckPage;
