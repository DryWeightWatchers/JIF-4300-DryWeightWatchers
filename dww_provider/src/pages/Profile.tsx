
import React from 'react';
import styles from '../styles/Profile.module.css'; 

const Profile = () => {

  return (
    <div className={styles.profileContainer}>
      <h1>Profile / Settings</h1>
      <div>
        <label>Full Name:</label>
        <p>Alice Smith</p>
      </div>

      <div>
        <label>Email:</label>
        <p>alice@example.com</p>
        <a href='#'>Change email</a>
      </div>

      <div>
        <label>Phone:</label>
        <p>(123) 456-7890</p>
        <a href='#'>Change phone</a>
      </div>

      <div>
        <label>Password:</label>
        <p>********</p>
        <a href='#'>Show password</a>
        <a href='#'>Change password</a>
      </div>

      <div>
        <label>Two-Factor Authentication (2FA):</label>
        <p>Not set up</p>
        <a href='#'>Set up 2FA</a>
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

    </div>
  );
};

export default Profile;
