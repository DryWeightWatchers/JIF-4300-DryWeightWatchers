# Overview 

Dry Weight Watchers is a cross-platform application to help healthcare providers monitor the weights of patients with congestive heart failure (CHF). The heart's inability to pump blood effectively often leads to fluid buildup in the tissues of CHF patients. A sudden spike in weight can indicate worsening symptoms and require medical attention. By monitoring their weight everyday with our app, patients can rest assured that their doctor will be automatically notified of any anomalies, helping them to provide timely care and potentially prevent life-threatening complications. 

# Developer Setup 

### Prerequisites: 

You'll need Node.js and Python installed. You can verify if you have them by opening a terminal and running `node -v` and `python --version`, respectively. They should output a version number if they exist on your system. 

You'll need to install MySQL Server from [here](https://dev.mysql.com/downloads/installer/) to access the database. (You'll also need credentials which will be shared privately.) 

You'll also need to install the Expo Go app on your phone to run the development build of the mobile front-end. 

### Installing project dependencies: 

After cloning the repo, go to the root directory: 
- `dww_patient` is our cross-platform mobile front-end, developed with React Native / Expo. Navigate here and run `npm install` to generate the dependencies from the *package.json* file, which will appear in a *node-modules* folder. 
- `dww_provider` is our other front-end for healthcare providers, developed with React / Vite. As above, navigate here and run `npm install` to generate the dependencies. 
- `dww_backend` is our Python server written with Django. Before installing its dependencies, you'll need to create a Python virtual environment. Do this by running `python -m venv venv` in the root directory. Then activate the venv with either `venv\Scripts\activate` (on Windows), or `source venv/bin/activate` (on MacOS or Linux). With the venv activated, run `pip install -r requirements.txt` to install the dependencies. 

Always follow these practices whenever you are installing/uninstalling Python dependencies: 
- Make sure the venv is activated. 
- Afterwards, run `pip freeze > requirements.txt` in the root directory to update the dependency file. 

### Accessing the database: 

Open MySQL Workbench, which was included in MySQL Server. In the top menu bar, select *Database > Connect to Database*. Enter the appropriate credentials and click OK. In the new tab, go to the Navigator pane on the left and double-click the *dry_weight_watchers* database to select it (it will turn bold). In the Query pane in the center, you can run SQL commands on the database. Try using `select * from <TableName>` to see some data. 

### Running the application: 

To run the mobile front-end, navigate to `dww_patient` and run `npx expo start`. It will start a local development server and output a QR code. Scan the code with your phone to open the app in Expo Go, or go to `http://localhost:8081` to open the app in a browser. Your phone must be connected to the same wifi network as your development machine for Expo Go to work. 

To run the web front-end, navigate to `dww_provider` and run `npm run dev`. It will start a local Vite development server which you can access via `http://localhost:5173`. 
