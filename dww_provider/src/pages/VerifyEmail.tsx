import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            const verifyEmail = async () => {
                try {
                    const res = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/verify-email?token=${token}`, {
                        method: 'GET',
                    });

                    if (!res.ok) {
                        const errorData = await res.json();
                        setMessage(errorData.message || 'Failed to verify email');
                    } else {
                        setMessage('Email verified successfully! Redirecting to login...');
                        setTimeout(() => navigate('/login'), 3000);
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        setMessage(error.message);
                    }
                }
            };

            verifyEmail();
        }
    }, [searchParams, navigate]);

    return (
        <div>
            <h1>Verify Email</h1>
            <p>{message}</p>
        </div>
    );
};

export default VerifyEmail;
