import React, { useEffect, useState, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Firestore database
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../components/style/Dashboard.css';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [linkScans, setLinkScans] = useState([]);
    const [emailChecks, setEmailChecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchResults = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch link scans
            const linkQuery = query(
                collection(db, 'scans'),
                where('userId', '==', user.uid)
            );
            const linkSnapshot = await getDocs(linkQuery);
            const linkResults = linkSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setLinkScans(linkResults);

            // Fetch email checks
            const emailQuery = query(
                collection(db, 'emailChecks'),
                where('userId', '==', user.uid)
            );
            const emailSnapshot = await getDocs(emailQuery);
            const emailResults = emailSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setEmailChecks(emailResults);
        } catch (err) {
            console.error('Error fetching user results:', err);
            setError('Failed to load results. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchResults();
        }
    }, [user, fetchResults]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error('Failed to logout:', err);
        }
    };

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <p>Welcome, <strong>{user.email}</strong></p>

            {loading ? (
                <p>Loading your data...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <>
                    <h2>Your Link Scans</h2>
                    {linkScans.length === 0 ? (
                        <p>No link scans found.</p>
                    ) : (
                        <ul>
                            {linkScans.map((scan) => (
                                <li key={scan.id}>
                                    <strong>Type:</strong> Link Scan <br />
                                    <strong>Link:</strong> {scan.link || 'N/A'} <br />
                                    <strong>Malicious:</strong> {scan.isMalicious ? 'Yes' : 'No'} <br />
                                    <strong>Score:</strong> {scan.score} <br />
                                    <strong>Categories:</strong> {scan.categories.join(', ')} <br />
                                    <strong>Timestamp:</strong>{' '}
                                    {scan.timeStamp?.toDate().toLocaleString() || 'N/A'}
                                </li>
                            ))}
                        </ul>
                    )}

                    <h2>Your Email Checks</h2>
                    {emailChecks.length === 0 ? (
                        <p>No email checks found.</p>
                    ) : (
                        <ul>
                            {emailChecks.map((check) => (
                                <li key={check.id}>
                                    <strong>Type:</strong> Email Check <br />
                                    <strong>Email:</strong> {check.email || 'N/A'} <br />
                                    <strong>Breaches:</strong>{' '}
                                    {check.breaches?.length > 0 ? (
                                        <ul>
                                            {check.breaches.map((breach, index) => (
                                                <li key={index}>{breach.Name}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        'No breaches found'
                                    )}
                                    <strong>Timestamp:</strong>{' '}
                                    {check.timeStamp?.toDate().toLocaleString() || 'N/A'}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
            <button class="logout-button" onClick={handleLogout} style={{ marginTop: '20px' }}>
                Logout
            </button>
        </div>
    );
}
