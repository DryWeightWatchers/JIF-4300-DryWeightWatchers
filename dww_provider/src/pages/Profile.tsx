
import React from 'react';
import styles from '../styles/Profile.module.css'; 

const Profile = () => {

  return (
    <div className={styles.profileContainer}>
      <h1>Profile / Settings</h1>
      <div>
        <label>Full Name:</label>
        <div>
          <p>Alice Smith</p>
        </div>
      </div>

      <div>
        <label>Provider ID:</label>
        <div>
          <p>WQM-U6A</p>
        </div>
      </div>

      <div>
        <label>Email:</label>
        <div>
          <p>alice@example.com</p>
          <a href='#'>Change email</a>
        </div>
      </div>

      <div>
        <label>Phone:</label>
        <div>
          <p>(123) 456-7890</p>
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

    </div>
  );
};

export default Profile;
