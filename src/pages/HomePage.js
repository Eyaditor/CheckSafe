import React, { useState } from 'react';
import axios from 'axios';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import '../components/style/Homepage.css';

// Using the backend URL stored in the environment variable
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const HomePage = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [error, setError] = useState(null);

    const fetchResultsWithRetry = async (scanId, retryCount = 0) => {
        try {
            const resultResponse = await axios.get(`${BACKEND_URL}/scan-results/?scan_id=${scanId}`);
            const imageResponse = await axios.get(`${BACKEND_URL}/scan-results-image/?scan_id=${scanId}`, { responseType: 'blob' });

            const verdicts = resultResponse.data.verdicts;
            const overallVerdict = verdicts.overall || {};
            const isMalicious = overallVerdict.malicious || false;
            const score = overallVerdict.score || 0;
            const categories = overallVerdict.categories && overallVerdict.categories.length > 0
                ? overallVerdict.categories
                : ['Safe'];

            setResults({
                isMalicious,
                score,
                categories,
            });

            if (imageResponse.status === 200) {
                setResults(prevResults => ({
                    ...prevResults,
                    image: URL.createObjectURL(imageResponse.data),
                }));
                setImageError(false);
            } else {
                setImageError(true);
            }

            setLoading(false);

            await storeScanResult(scanId, url, {
                isMalicious,
                score,
                categories,
                image: imageResponse.status === 200 ? URL.createObjectURL(imageResponse.data) : "",
                scanStatus: 'completed'
            });

        } catch (error) {
            if (error.response && error.response.status === 500 && retryCount < 3) {
                console.log(`Retrying... attempt ${retryCount + 1}`);
                setTimeout(() => fetchResultsWithRetry(scanId, retryCount + 1), 25000);
            } else {
                setError("Failed to fetch scan results. Please try again later.");
                setLoading(false);
            }
        }
    };

    const storeScanResult = async (scanId, link, results) => {
        try {
            const auth = getAuth();
            const userId = auth.currentUser ? auth.currentUser.uid : 'anonymous';
            const scanStatus = 'pending';

            await addDoc(collection(db, "scans"), {
                link,
                result: results,
                categories: results.categories,
                isMalicious: results.isMalicious,
                score: results.score,
                scanId,
                scanStatus,
                timeStamp: Timestamp.fromDate(new Date()),
                userId,
            });
        } catch (error) {
            console.error("Error storing scan result in Firestore:", error);
        }
    };

    const handleScan = async () => {
        const fullurl = `${BACKEND_URL}/scan-url/?url=${url}`;
        try {
            const response = await axios.post(fullurl);
            const scanId = response.data.uuid;
            setLoading(true);
            setError(null);
            setTimeout(() => {
                fetchResultsWithRetry(scanId);
            }, 15000);
        } catch (error) {
            setError("Failed to initiate scan. Please check the URL and try again.");
        }
    };

    return (
        <div className="home-page">
            <h1>URL Scanner</h1>
            <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL"
            />
            <button onClick={handleScan}>Scan URL</button>

            {loading && <p>Loading... Please wait for the results.</p>}

            {error && <p style={{ color: 'red' }}>{error}</p>} { }

            {results && (
                <div className="results">
                    <div className="text">
                        <h4>Scan Results</h4>
                        <p><strong>Malicious: </strong>{results.isMalicious ? 'Yes' : 'No'}</p>
                        <p><strong>Score: </strong>{results.score}</p>
                        <p><strong>Category: </strong>{results.categories.join(', ')}</p>
                    </div>

                    {!imageError ? (
                        results.image && (
                            <div>
                                <h4>Screenshot</h4>
                                <img src={results.image} alt="Scan Screenshot" style={{ width: '100%', height: 'auto' }} />
                            </div>
                        )
                    ) : (
                        <p>Couldn't load the screenshot image.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default HomePage;
