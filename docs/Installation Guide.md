# Overview: 

This document is intended to give the client, or any future development team, all the information they need to know to manage the relevant accounts and setup the software for future development if needed. Sensitive credentials will not be included here but will be transferred separately. 

The software consists of several parts: 
- The **MySQL database**, hosted on **Amazon AWS**. 
- The **Django server**, also hosted on **Amazon AWS**. 
- The **web interface** for healthcare providers, hosted on https://dryweightwatchers.com via **Amazon AWS**. 
- The **mobile interface** for patients, which is deployed to the Android and iOS app stores. 

All of the code is open-source and located at https://github.com/DryWeightWatchers/JIF-4300-DryWeightWatchers. 

# Handoff checklist: 

- [ ] **Transfer the AWS root account** 
    - [ ] Remove the inbound security rules that allow traffic to the RDS instance from any origin 
	- [ ] Change account login and personal info (email, address, name, etc.) 
	- [ ] Change billing information 
	- [ ] Remove 2FA and set it up for client 
- [ ] **Transfer the DryWeightWatchers email account** 
	- [ ] Share credentials 
	- [ ] Change recovery phone 
	- [ ] Remove 2FA and set it up for client 
- [ ] **Transfer the Twilio account** (used for the app's text notification feature) 
- [ ] **Transfer the Expo development account** 
- [ ] **Transfer the Google Play store account** 
- [ ] **Create separate Apple developer account for iOS deployment** 
- [ ] **Share the AWS database credentials** 

# AWS guide: 

This section will give an overview of how to navigate AWS and the services used by our application. 

To sign in, go to https://aws.amazon.com/ and click "Sign into the Console". Note that there are two types of accounts: a **root account** which has admin privileges, and **IAM users**, which have limited privileges that can be managed by the root account. The login form prompts for IAM credentials by default - you must click "Sign in using root user email" to use the root account. All IAMs users must use a single **Account ID** to sign in, in addition to their individual credentials. Howeer, here we assume we are using the root account. 

Upon logging in you should see a dashboard with a list of AWS services and some cost/usage information, among other things. The services used by our software are the following: 
- **Aurora and RDS** - for hosting the MySQL database. 
- **Elastic Beanstalk and EC2** - for hosting the Django server. 
- **CloudFront** - for hosting the web interface at https://dryweightwatchers.com. 
- **Virtual Private Cloud (VPC)** - infrastructure needed to deploy on the above services. 
- **Identity and Access Management (IAM)** - for managing multiple user accounts. 
- **Billing and Cost Management** - self explanatory. 

The exact cost of these services is hard to determine in advance because of AWS's complicated billing scheme. However, rough estimates are as follows: 
- $12/month for the RDS service (database hosting), although it is free until November 2025. 
- $10/month for the EC2 service (server hosting), although it is free until around February 2026. 
- $12/month for the VPC service (networking infrastructure). 
In the future, if the number of users scales up significantly, you may need to deploy more resources on the existing services, which will increase costs. 


# Developer Setup 

### Prerequisites: 

You'll need Node.js and Python installed. You can verify if you have them by opening a terminal and running `node -v` and `python --version`, respectively. They should output a version number if they exist on your system. 

You'll need to install MySQL Server from [here](https://dev.mysql.com/downloads/installer/) to access the database. (You'll also need credentials which will be shared privately.) 

For testing, you'll need an Android or iOS emulator, such as one available in Android Studio. Testing on iOS requires macOS and the XCode IDE. 

To deploy the application to AWS you will need to install the AWS CLI from [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html). (You'll also need aws credentials which will be shared privately.)

In order to connect to the database locally, you'll need to adjust a security setting in the AWS Console. Go to the *Aurora and RDS* service, click on the database, then in the *Connectivity & Security* tab, click on the *VPC security group*, then click it's ID again. You should see a rule showing the the database only receives inbound traffic from a particular other *security group* - the one associated with the deployed Django server. If you want to connect to the database from a local development server, you'll have to add additional inbound rules to allow traffic from your IP. For security reasons, we recommend not leaving the database exposed to all IPs, as that means anyone who knows the endpoint could execute commands directly on the database. 

### Installing project dependencies: 

After cloning the repo, go to the root directory: 
- `dww_patient` is our cross-platform mobile front-end, developed with React Native / Expo. Navigate here and run `npm install` to generate the dependencies from the *package.json* file, which will appear in a *node-modules* folder. 
- `dww_provider` is our other front-end for healthcare providers, developed with React / Vite. As above, navigate here and run `npm install` to generate the dependencies. 
- `dww_backend` is our Python server written with Django. Before installing its dependencies, you'll need to create a Python virtual environment. Do this by running `python -m venv venv` in the root directory. Then activate the venv with either `venv\Scripts\activate` (on Windows), or `source venv/bin/activate` (on MacOS or Linux). With the venv activated, run `pip install -r requirements.txt` to install the dependencies. 

Always follow these practices whenever you are installing/uninstalling Python dependencies: 
- Manually add the dependency to the `requirements.in` text file. (e.g., if you want to do `pip install xyz`, then add `xyz` on its own line. You don't necessarily have to specify a version.) 
- Make sure the venv is activated. 
- Then run `pip-compile --output-file=requirements.txt requirements.in` to generate a new `requirements.txt` dependency file which others can use to install the dependencies. 

### Setting up environment variables: 

Each subrepository (`dww_backend`, `dww_patient`, and `dww_provider`) has a file called `.env_template`. You must input the necessary credentials into each of those files, then rename each of them to `.env`. See each file for more specific instructions. 

### Accessing the database: 

Open MySQL Workbench, which was included in MySQL Server. In the top menu bar, select *Database > Connect to Database*. Enter the appropriate credentials and click OK. In the new tab, go to the Navigator pane on the left and double-click the *dry_weight_watchers* database to select it (it will turn bold). In the Query pane in the center, you can run SQL commands on the database. Try using `select * from <TableName>` to see some data. 

### Running the application: 

To run the mobile front-end, navigate to `dww_patient` and run `npx expo run:android` or `npx expo run:ios`. It will start the app in an emulator if you have one. 

To run the web front-end, navigate to `dww_provider` and run `npm run dev`. It will start a local Vite development server which you can access via `http://localhost:5173`. 

To run the backend server, navigate to `dww/backend` and run `python manage.py runserver 0.0.0.0:8000`.

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

#### Deploying patient mobile app
- To deploy the patient mobile app you need several things (inside `dww_patient` directory):
	- Set up the App signing for google play:
		- Run: `eas credentials`
		- Select Android > Production > Keystore > Setup New:
		- Press enter for default name
		- Say yes to set as default credentials
  		- Say no to create a new one
    		- Download the key provided privately and write the path to the key when prompted
		- It will ask for the key credentials, also shared privately. 
  	- Run: `eas build --platform android` for android or `eas build --platform ios` for ios.
  		- If not logged in run: `eas login`
  			- Login to the eas account using the credentials provided privately
  	 - If you're deploying for android, download the resulting .aab file.
  	   	- Log into [Play Console](https://play.google.com/console/u/1/developers/4892570457761942405/app/4974335936513925280/app-dashboard?timespan=thirtyDays) and choose Production or Testing, and upload your aab file and publish the changes.
	- If you're deploying for ios, run `eas submit --platform ios`
 		- If not logged in it will ask you to log into the apple developer account, use the credentials shared privately.
		- Once this is done, log into the [App Store Connect](https://appstoreconnect.apple.com/apps/6744403523/distribution) and next to IOS App press the +
  			- Name the version
			- Specify the changes
   			- Select the build and publish the changes
