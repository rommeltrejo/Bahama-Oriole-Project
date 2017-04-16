# Bahama-Oriole-Project Developer Guide

# Follow this guide to get the files:
1. Install or update Node.js on you computer: https://nodejs.org/en/download/

2. then follow the guide https://firebase.google.com/docs/cli/ Don't do firebase init
 * npm install -g firebase-tools
 * firebase login

3. select a directory to keep files for this project

4. git clone https://github.com/rommeltrejo/Bahama-Oriole-Project.git (or the ssh link from the Clone or Download button)

5. cd into Bahama-Oriole-Project

6. firebase init

7. select Bahama oriole project

8. select hosting

9. press Enter

10. Type N for everything except the Do you want to install firebase dependencies

  Code is located in public the files, root file contains firebase configuration file

# To update the page 
1. ensure you have the latest copy of the files: git pull

2. if there was a merge error take a look at it. someone worked on that section

3. add the files git add public/* 

4. commit your code: git commit -m "your update log"

5. push your code online: git push

6. publish to the website: firebase deploy

7. Wait till it finishes then go to https://cs447bioresearchform.firebaseapp.com/ to see changes.

  If it's not showing up. press shift when you click on refresh or open an incognito tab, if it doesn't show up try again or ask on Slack.







