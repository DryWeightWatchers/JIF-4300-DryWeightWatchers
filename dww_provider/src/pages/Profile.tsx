import { useState, useEffect } from 'react';
import styles from '../styles/Profile.module.css';
import { useAuth } from '../components/AuthContext.tsx'

type ProfileData = {
  firstname: string,
  lastname: string,
  shareable_id: string,
  email: string,
  phone: string
}

const Profile = () => {

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  const serverUrl = import.meta.env.VITE_PUBLIC_DEV_SERVER_URL;


  const fetchProfileData = async () => {
    try {
      const res = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/profile/`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!res.ok) {
        setError(`HTTP error: ${res.status}`);
        return; 
      }
      const data = await res.json();
      setProfileData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProfileData();
  }, []);

  const getCSRFToken = async () => {
    const response = await fetch(`${serverUrl}/get-csrf-token/`, {
      credentials: 'include', 
    });
    const data = await response.json();
    return data.csrfToken;
  };

  const handleDeleteAccount = async () => {
    const csrfToken = await getCSRFToken();

    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmDelete) return;
    try {
      const response = await fetch(`${serverUrl}/delete-account/`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
        credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error deleting account: ${errorText}`);
    } 

    alert("Your account has been successfully deleted.");
    logout();

    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again.");
    }
  }

  if (isLoading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>Error: {error}</p>
  }

  return (
    <div className={styles.profileContainer}>
      <h1>Profile / Settings</h1>
      <div>
        <label>Full Name:</label>
        <div>
          <p>{profileData?.firstname} {profileData?.lastname}</p>
        </div>
      </div>

      <div>
        <label>Provider ID:</label>
        <div>
          <p>{profileData?.shareable_id}</p>
        </div>
      </div>

      <div>
        <label>Email:</label>
        <div>
          <p>{profileData?.email}</p>
          <a href='#'>Change email</a>
        </div>
      </div>

      <div>
        <label>Phone:</label>
        <div>
          <p>{profileData?.phone}</p>
          <a href='#'>Change phone</a>
        </div>
      </div>

      <div>
        <label>Password:</label>
        <div>
          <div>
            <p>********</p>
            <a href='#'>Show password</a>
          </div>
          <a href='#'>Change password</a>
        </div>
      </div>

      <div>
        <label>Two-Factor Authentication (2FA):</label>
        <div>
          <p>Not set up</p>
          <a href='#'>Set up 2FA</a>
        </div>
      </div>

      <div>
        <label>Notification Preferences:</label>
        <label>
          <input type='checkbox' value='email' />
          Email
        </label>
        <label>
          <input type='checkbox' value='text' />
          Text
        </label>
      </div>
      <div className={styles.buttonContainer}>
        <button type="button" className={styles.deleteButton} 
          onClick={handleDeleteAccount}>Delete Account</button>
      </div>

    </div>
  );
};

export default Profile;
