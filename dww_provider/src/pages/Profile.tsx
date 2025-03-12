import { useState, useEffect } from 'react';
import styles from '../styles/Profile.module.css';
import { useAuth } from '../components/AuthContext.tsx'
import { useNavigate } from 'react-router-dom';
import { formatPhoneNumber } from '../utils/formatting.ts';

type ProfileData = {
  firstname: string,
  lastname: string,
  shareable_id: string,
  email: string,
  phone: string,
  is_verified: boolean,
}

const Profile = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [editingPassword, setEditingPassword] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const serverUrl = import.meta.env.VITE_PUBLIC_DEV_SERVER_URL;
  const { logout } = useAuth();
  const navigate = useNavigate();

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
      console.log(data);
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
      navigate('/login');

    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again.");
    }
  }

  const handleUpdate = async (field: 'email' | 'phone') => {
    if (!tempValue) {
      setMessage(`Please enter a valid ${field}.`);
      return;
    }

    try {
      const csrfToken = await getCSRFToken();
      const response = await fetch(`${serverUrl}/update-${field}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ [field]: tempValue }),
      });

      if (!response.ok) throw new Error(await response.text());

      setMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
      setProfileData((prev) => (prev ? { ...prev, [field]: tempValue } : null));
      setEditingField(null); // Exit edit mode
    } catch (error) {
      setMessage(`Failed to update ${field}. Please try again.`);
    }
  };


  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match.');
      return;
    }

    try {
      const csrfToken = await getCSRFToken();
      const response = await fetch(`${serverUrl}/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword }),
      });

      if (!response.ok) throw new Error(await response.text());

      setMessage('Password updated successfully!');
      setEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage('Failed to update password. Please try again.');
    }
  };


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
        <div className={styles.emailContainer}>
          {editingField === 'email' ? (
            <>
              <input
                type="email"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
              />
              <button onClick={() => handleUpdate('email')}>Update</button>
              <button onClick={() => setEditingField(null)}>Cancel</button>
            </>
          ) : (
            <>
              <p>{profileData?.email}</p>
              {!profileData?.is_verified && (
                <div className={styles.warningTooltip}>
                  <span className={styles.warningIcon}>⚠️</span>
                  <span className={styles.tooltipText}>Email not verified.</span>
                </div>
              )}
              <a href="#" onClick={() => { setEditingField('email'); setTempValue(profileData?.email || '') }}>Change email</a>
            </>
          )}
        </div>
      </div>

      <div>
        <label>Phone:</label>
        <div>
          {editingField === 'phone' ? (
            <>
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
              />
              <button onClick={() => handleUpdate('phone')}>Update</button>
              <button onClick={() => setEditingField(null)}>Cancel</button>
            </>
          ) : (
            <>
              <p>{formatPhoneNumber(profileData?.phone)}</p>
              <a href="#" onClick={() => { setEditingField('phone'); setTempValue(profileData?.phone || '') }}>Change phone</a>
            </>
          )}
        </div>
      </div>

      <div>
        <label>Password:</label>
        {editingPassword ? (
          <>
            <div>
              <label>Current Password:</label>
              <input type={showPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <label>New Password:</label>
              <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label>Confirm New Password:</label>
              <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <div>
              <button className={styles.showPasswordBtn} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide Passwords" : "Show Passwords"}
              </button>
              <button className={styles.updateBtn} onClick={handleChangePassword}>Update Password</button>
              <button className={`${styles.cancelBtn}`} onClick={() => setEditingPassword(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <div>
            <p>********</p>
            <a href="#" onClick={(e) => { e.preventDefault(); setEditingPassword(true); }}>Change password</a>
          </div>
        )}
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
      <div>
        <div className={styles.btnContainer}>
          <button type="button" className={styles.deleteAccountBtn}
            onClick={handleDeleteAccount}>Delete Account</button>
        </div>
      </div>

    </div>
  );
};

export default Profile;
