# Dry Weight Watchers - Overview 

Dry Weight Watchers is a cross-platform application to help healthcare providers monitor the weights of patients with congestive heart failure (CHF). The heart's inability to pump blood effectively often leads to fluid buildup in the tissues of CHF patients. A sudden spike in weight can indicate worsening symptoms and require medical attention. By monitoring their weight everyday with our app, patients can rest assured that their doctor will be automatically notified of any anomalies, helping them to provide timely care and potentially prevent life-threatening complications. 

# Release Notes
<details open>
  <summary>Version 1.0.0: Full Release</summary>
  
  ### Features 
  #### For patients on the mobile interface: 
  - Patient can create an account and login 
  - After login, the patient can see a basic dashboard with navigation to different placeholder pages for entering data, and viewing data. 
  - Patient can log out of their account
  - Patient can register their provider
  - Patients can record their weight to the database on the Enter Data screen.
  - Patients can see a list of providers associated with their account and choose to remove providers on the Provider List screen.
  - Patients may delete their account and all personal data associated with their account from the Accounts screen.
  - Patients can create daily reminders to assist them in routinely recording their weight. 
     - They can create, edit, and delete reminders in the Reminders screen.
     - Reminders can be customized to any time and specify which days of the week the reminder should occur.
  - Patients will be remembered with a token when they are logged in. If this token is still valid next app opening, they are automatically logged in.
  - Patients can view a visualization of their weight record in one of two ways:
    - a line graph on a chart showing change over time
    - a calendar marking days with a successful weight record
  - Patients may click on any point or day in the dashboard screen to view the exact weight record, day, and notes associated with that day.
  - Patients may edit their account details in profile screen.
  - Patients may add notes to each day for personal use.
  - Patients may indicate a preference to be reminded/alerted by push notification and/or email notification.
  #### For providers on the desktop interface: 
  - Providers can create an account and login 
  - After login, the provider can see a basic dashboard with navigation to different placeholder pages for viewing their dashboard, home, and profile
  - Provider can log out of their account
  - Providers can see a dashboard containing information on all patients assigned to them.
  - Providers can delete their account and all personal data associated with their account.
  - Providers have the same data visualizations available to the patient, but are able to view individual patient details within the patient details screen.
  - Provider may edit/change their account details.
  - Large UI overhaul to look more modern.
  - Providers may edit and remove notes and special field data from patient files to maintain information relevancy and better suit their needs.
  - Providers may indicate a preference to be reminded/alerted by email or text notification.
  - Providers will receive a real-time alert when a patient under their care records a weight that cross a designated danger threshold.
    - Threshold may be dynamically altered/set for individual patients
    - Patients who cross such a threshold will be visually indicated in the provider's patient dashboard.
    - Alerts will not contain personal information of patients, but rather alarm the provider to check their dashboard for any in-danger patients.

  ### Bug Fixes
  - (N/A)

  ### Known Issues
  - Deleted accounts are not 'recreated' or removed from deleted users table upon creation of a new account reusing that email.
  - 2-factor authentication option is present in provider interface, but was not in the scope of the first release.
</details>

# Installation Guide
Please review the installation guide located [here](https://github.com/DryWeightWatchers/JIF-4300-DryWeightWatchers/blob/dev/docs/Installation%20Guide.md). 
