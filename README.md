# Overview 

Dry Weight Watchers is a cross-platform application to help healthcare providers monitor the weights of patients with congestive heart failure (CHF). The heart's inability to pump blood effectively often leads to fluid buildup in the tissues of CHF patients. A sudden spike in weight can indicate worsening symptoms and require medical attention. By monitoring their weight everyday with our app, patients can rest assured that their doctor will be automatically notified of any anomalies, helping them to provide timely care and potentially prevent life-threatening complications. 

# Developer Setup 

You'll need Node.js and Python installed. You can verify if you have them by opening a terminal and running `node -v` and `python --version`, respectively. They should output a version number if they exist on your system. 

After cloning the repo, you'll need to install all the dependencies. Make sure you're in the project's root directory: 
- `dww_patient` is our cross-platform mobile front-end, developed with React Native / Expo. Navigate here and run `npm install` to generate the dependencies from the *package.json* file, which will appear in a *node-modules* folder. 
- `dww_provider` is our other front-end for healthcare providers, developed with React. As above, navigate here and run `npm install` to generate the dependencies. 
- `dww_backend` is our Python server written with Django. Before installing its dependencies, you'll need to create a Python virtual environment. Do this by running `python -m venv venv`. Then activate the venv with `venv\Scripts\activate` (on Windows), or `source venv/bin/activate` (on MacOS or Linux). With the venv activated, run `pip install -r requirements.txt` to install the dependencies. 

Always follow these practices whenever you are installing/uninstalling Python dependencies: 
- Make sure the venv is activated. 
- Afterwards, run `pip freeze > requirements.txt` in the root directory to update the dependency file. 