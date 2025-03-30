# Dry Weight Watchers - Overview 

Dry Weight Watchers is a cross-platform application to help healthcare providers monitor the weights of patients with congestive heart failure (CHF). The heart's inability to pump blood effectively often leads to fluid buildup in the tissues of CHF patients. A sudden spike in weight can indicate worsening symptoms and require medical attention. By monitoring their weight everyday with our app, patients can rest assured that their doctor will be automatically notified of any anomalies, helping them to provide timely care and potentially prevent life-threatening complications. 


# Release Notes

<details>
  <summary>Version 0.4.0: Notifications & Alerts </summary>
  
  ### Features
  #### For patients on the mobile interface: 
  - Patients may indicate a preference to be reminded/alerted by push notification and/or email notification.
  #### For providers on the desktop interface: 
  - Providers may edit and remove notes and special field data from patient files to maintain information relevancy and better suit their needs.
  - Providers may indicate a preference to be reminded/alerted by email or text notification.
  - Providers will receive a real-time alert when a patient under their care records a weight that cross a designated danger threshold.
    - Threshold may be dynamically altered/set for individual patients
    - Patients who cross such a threshold will be visually indicated in the provider's patient dashboard.
    - Alerts will not contain personal information of patients, but rather alarm the provider to check their dashboard for any in-danger patients.

  ### Bug Fixes
  - Shareable ID is fixed to be unique within DB
  - Enter provider ID UI on Account screen in patient interface moved to Provider List screen.
  - Various screens (including but not limited to: Login, Signup, Profile, Reminders) on patient interface fixed with added KeyboardAvoidingViews, SafeAreaViews, ScrollViews, etc.
  - Patient interface 'forgot password' removed.
  - Patient home screen overhauled for visual appeal and user utility.
  - Refresh session token error message removed from patient interface for user experience.
  - Inconsistent use of pounds and kilograms for patient weight tracking

  ### Known Issues
  - Patient log-in does not have an option to unhide password.
  - Patient details screen on provider interface can theoretically overflow with same-day weight records if too many exist on the same day.
  - Many error messages are mainly coded in console messages, leaving little information feedback to the typical user.
  - Loading screens are only present in a few recent screens rather than universal/standardized.
  - Various typescript errors due to unstrictly typed functions. Does not impede functionality.
  - Patients cannot input decimal weights, only integers.
</details>

<details>
  <summary>Version 0.3.0: Weight Visualization and Provider Interface </summary>
  
  ### Features
  #### For patients on the mobile interface: 
  - Patients can view a visualization of their weight record in one of two ways:
    - a line graph on a chart showing change over time
    - a calendar marking days with a successful weight record
  - Patients may click on any point or day in the dashboard screen to view the exact weight record, day, and notes associated with that day.
  - Patients may edit their account details in profile screen.
  - Patients may add notes to each day for personal use.
  #### For providers on the desktop interface: 
  - Providers have the same data visualizations available to the patient, but are able to view individual patient details within the patient details screen.
  - Provider may edit/change their account details.
  - Large UI overhaul to look more modern.

  ### Bug Fixes
  - Account email, first, and last name are recorded upon account deletion instead of total deletion.
  - Reminders now make a little noise.
  - User sessions are correctly deleted routinely from database.

  ### Known Issues
  - Shareable ID input on mobile interface has autocorrect enabled.
  - Shareable ID is not marked as required unique.
  - Accounts screen contains a large number of account-related features. These features can likely be separated onto their own screens to reduce clutter.
  - Patient log-in has a 'forgot password' option, but that feature is not planned in scope of the project.
  - Patient log-in does not have an option to unhide password.
  - Patient details screen can theoretically overflow with same-day weight records if too many exist on the same day.
  - Patient home screen is functionally unnecessary. A mobile UI overhaul may remove it and default to Enter Data screen instead.
  - Many error messages are mainly coded in console messages, leaving little information feedback to the typical user.
  - Loading screens are only present in a few recent screens rather than universal/standardized.
  - Various typescript errors due to unstrictly typed functions. Does not impede functionality.
</details>

<details>
  <summary>Version 0.2.0: Record Weight, Account Settings, Reminder Notifications</summary>
  
  ### Features
  #### For patients on the mobile interface: 
  - Patients can record their weight to the database on the Enter Data screen.
  - Patients can see a list of providers associated with their account and choose to remove providers on the Provider List screen.
  - Patients may delete their account and all personal data associated with their account from the Accounts screen.
  - Patients can create daily reminders to assist them in routinely recording their weight. 
     - They can create, edit, and delete reminders in the Reminders screen.
     - Reminders can be customized to any time and specify which days of the week the reminder should occur.
  - Patients will be remembered with a token when they are logged in. If this token is still valid next app opening, they are automatically logged in.
  #### For providers on the desktop interface: 
  - Providers can see a dashboard containing information on all patients assigned to them.
  - Providers can delete their account and all personal data associated with their account.

  ### Bug Fixes
  - Fixed provider profile information being shown after logout.
  - Fixed patient signup allowing provider accounts to be created on mobile interface.

  ### Known Issues
  - Shareable ID input on mobile interface has autocorrect enabled.
  - Shareable ID is not marked as required unique.
  - Accounts screen contains a large number of account-related features. These features can likely be separated onto their own screens to reduce clutter.
  - The JWT access tokens are very short-lived. Functionally, if the access token is refreshed mid-operation and the operation fails, this could log out the patient and make it unclear whether the operation succeeded and confuse the patient.
  - Various typescript errors due to unstrictly typed functions. Does not impede functionality.
</details>

<details>
  <summary>Version 0.1.0: Initial Setup</summary>
  
  ### Features 
  #### For patients: 
  - Patient can create an account and login 
  - After login, the patient can see a basic dashboard with navigation to different placeholder pages for entering data, and viewing data. 
  - Patient can log out of their account
  - Patient can register their provider
  #### For providers: 
  - Providers can create an account and login 
  - After login, the provider can see a basic dashboard with navigation to different placeholder pages for viewing their dashboard, home, and profile
  - Provider can log out of their account

  ### Bug Fixes
  - (N/A)

  ### Known Issues
  - (none) 
</details>

# Developer Setup 

### Prerequisites: 

You'll need Node.js and Python installed. You can verify if you have them by opening a terminal and running `node -v` and `python --version`, respectively. They should output a version number if they exist on your system. 

You'll need to install MySQL Server from [here](https://dev.mysql.com/downloads/installer/) to access the database. (You'll also need credentials which will be shared privately.) 

You'll also need to install the Expo Go app on your phone to run the development build of the mobile front-end. 

To deploy the application to AWS you will need to install the AWS CLI from [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html). (You'll also need aws credentials which will be shared privately.)

### Installing project dependencies: 

After cloning the repo, go to the root directory: 
- `dww_patient` is our cross-platform mobile front-end, developed with React Native / Expo. Navigate here and run `npm install` to generate the dependencies from the *package.json* file, which will appear in a *node-modules* folder. 
- `dww_provider` is our other front-end for healthcare providers, developed with React / Vite. As above, navigate here and run `npm install` to generate the dependencies. 
- `dww_backend` is our Python server written with Django. Before installing its dependencies, you'll need to create a Python virtual environment. Do this by running `python -m venv venv` in the root directory. Then activate the venv with either `venv\Scripts\activate` (on Windows), or `source venv/bin/activate` (on MacOS or Linux). With the venv activated, run `pip install -r requirements.txt` to install the dependencies. 

Always follow these practices whenever you are installing/uninstalling Python dependencies: 
- Manually add the dependency to the `requirements.in` text file. (e.g., if you want to do `pip install xyz`, then add `xyz` on its own line. You don't necessarily have to specify a version.) 
- Make sure the venv is activated. 
- Then run `pip-compile --output-file=requirements.txt requirements.in` to generate a new `requirements.txt` dependency file which others can use to install the dependencies. 

### Accessing the database: 

Open MySQL Workbench, which was included in MySQL Server. In the top menu bar, select *Database > Connect to Database*. Enter the appropriate credentials and click OK. In the new tab, go to the Navigator pane on the left and double-click the *dry_weight_watchers* database to select it (it will turn bold). In the Query pane in the center, you can run SQL commands on the database. Try using `select * from <TableName>` to see some data. 

When you first run the development server, you'll need to enter your database credentials into an `.env` file to ensure Django can access the database without exposing sensitive info to the repo. Follow the instructions in the `.env_template` file. 

### Running the application: 

To run the mobile front-end, navigate to `dww_patient` and run `npx expo start`. It will start a local development server and output a QR code. Scan the code with your phone to open the app in Expo Go, or go to `http://localhost:8081` to open the app in a browser. Your phone must be connected to the same wifi network as your development machine for Expo Go to work. 

To run the web front-end, navigate to `dww_provider` and run `npm run dev`. It will start a local Vite development server which you can access via `http://localhost:5173`. 

### Deploying the application to AWS: 
#### Deploying django server
- First, make sure you have the AWS CLI installed and configured with your credentials by running `aws configure`. 
    - If you don't have an Access keys, you can create one by going to the top right of the AWS Console in *Account > Security credentials > Access Key*. You will need the Access Key ID and Secret Access Key to configure your aws account in the cli. 
- To deploy the django server to elastic beanstalk, navigate to `dww_backend` and run `eb deploy --staged`. 
    - Other useful commands
        -  `eb status` to check the status of the environment
        - `eb logs` to check the logs of the environment

#### Deploying providers web app
- To deploy the provider web app there is a bash file called `deploy.sh` in the `dww_provider`. That will take care of the deployment for you. 
 
