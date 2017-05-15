'use strict';

/***************************************************************************************************
* File: main.js
* Date: 05/02/2017
* Authors:
* Rommel Trejo
* Lillian Lam
* Krunal Hirpara
* Sarah Newkirk 
* Andrew Maddox
* Sherwin Fong
*
* Project: Bahama Oriole Application
* Description: Code for generating all pages is defined in this page. in addition this page handles
*               -login 
*               -submitting forms
*               -searching up data
*               -deleting data
*               -auto filling the forms
*               -connecting firebase to the page
*               -sign up
*               -download data
*               -pretty much everything
*
* Known Issues: Works in Google Chrome and Mozilla Firefox. Behavior on MS Internet explorer is undefined.
*****************************************************************************************************/

var searchPageNoIdentifiersError = '<div class="alert alert-danger"><strong>Warning!</strong></br>No or wrong submission ID passed.</br> '+
        "The record might no longer exist in the database or you arrived at this page by mistake.</br>"+
        "Please try searching again and clicking on the submission you wish to edit</div>";
//log in message
var logInMessage = '<h1 id=greeting_message>Please Sign In</h1> <!--<img src="/images/bahamaoriole.png" id="image1"></img>-->'

/**
 * Research Form initialized the application
 * this is the builder. The Researchform object (note:lowercase)
 * gets initiated on JQuery document.ready function
 */


function ResearchForm() {
    //Add new pages to getCurrentPage() function or nothing will show up 
    //added for security
    if(getCurrentPage().includes("unknown")){
        $("body").remove();
        return;
    }else{
        console.log("Current page: "+ getCurrentPage());
    }   

    //they're used through the project
    this.submitButton = document.getElementById("submitForm");
    this.userPic = document.getElementById('user-pic');
    this.username = document.getElementById('user-name');
    this.signInButton = document.getElementById('sign-in');
    this.signOutButton = document.getElementById('sign-out');

    this.checkSetup();
    this.initFirebase();

    this.signOutButton.addEventListener('click', this.signOut.bind(this));
    this.signInButton.addEventListener('click', this.signIn.bind(this));

    if(getCurrentPage().includes("edit"))
    {
        fillForm();
    }
    

}


/**
 * Checks that the Firebase SDK has been correctly setup and configured.
 */
ResearchForm.prototype.checkSetup = function() {
    if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
        window.alert('You have not configured and imported the Firebase SDK. ' + 'Make sure you go through the codelab setup instructions.');
    } else if (config.storageBucket === '') {
        window.alert('Your Firebase Storage bucket has not been enabled. Sorry about that. This is ' + 'actually a Firebase bug that occurs rarely. ' + 'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' + 'and make sure the storageBucket attribute is not empty. ' + 'You may also need to visit the Storage tab and paste the name of your bucket which is ' + 'displayed there.');
    } else {
        console.log("firebase connection established successfully.");
    }
}
;

/**
 * This function handles login 
 */
ResearchForm.prototype.signIn = function() {
    // Sign in Firebase using popup auth and Google as the identity provider.
    var provider = new firebase.auth.GoogleAuthProvider();
    this.auth.signInWithPopup(provider);
    //ensure page loads after login in
    this.formify();
}
;


/**
 * Deleted a submission 
 * used on edit page and edit page only
 * if key doesn't exist an exception will occur.
 * exception not handled here
 * If succeeds user is sent to homepage
 */
function deleteSubmission(dataKey){    
    var removeKey= Researchform.dbRootRef.child(dataKey);
    document.getElementById("submit-status").innerHTML = "deletting submission ID "+dataKey;
    document.getElementById("submit-status").focus();
    
    removeKey.remove().then(
        function(anys){
            document.location.href="/";
        }
    );
}

/**
 * Adds or deletes the download all button on the index page
 * on log in/ log out/ auth change
 */
function doTheDownloadButton(on_off){
    if(on_off == "on"){
        if (!($('#download_all').length > 0)) {
            var ul = document.getElementById("navigation_bar");
            var li = document.createElement("li");
            li.setAttribute("id", "download_all");
            li.innerHTML = '<a href="javascript:downloadData();">Download all</a>';
            ul.appendChild(li);       
            //console.log("exists" +($('#download_all').length));
        }
    }else//turn off
    {
        $('#download_all').remove();
    }
}


/**
 * adds the delete entry option under the menu
 * if it doesn't exists yet
 */
function addDeleteEntry(){
    if (!($('#delete-button-nav-bar').length > 0)) {
        var ul = document.getElementById("navigation_bar");
        var li = document.createElement("li");
        li.setAttribute("id", "delete-button-nav-bar");
        li.innerHTML = '<a href="javascript:deleteSubmission(getSearchKey())">Delete Entry</a>';
        ul.appendChild(li);       
    }
}

/**
 * this is the security 
 * if user is not logged in make them login 
 * if not them let them use the app
 */
ResearchForm.prototype.formify =  function(){
    if(this.auth.currentUser){
        document.getElementById("submit_form").style.display = "block";

        if(getCurrentPage().includes("index")){
            document.getElementById("log_in_block").innerHTML = "";
            document.getElementById("log_in_block").style.display = "none";
            document.getElementById("log_in_block").style.visibility = "hidden";
            doTheDownloadButton("on");
        }else if(getCurrentPage().includes("edit")){
            addDeleteEntry();////add delete button to menu
        }          
    }
    else{
        if(getCurrentPage().includes("search")){
            document.getElementById("displayResults").innerHTML ="";
            document.getElementById("submit_form").style.display = "none";
           
        }else{
            document.getElementById("submit_form").style.display = "none";
            
            if(getCurrentPage() == "index")
            {
                document.getElementById("log_in_block").innerHTML = logInMessage;
                document.getElementById("log_in_block").style.display = "block";
                document.getElementById("log_in_block").style.visibility = "visible";
                doTheDownloadButton("off");
            }else if ($('#delete-button-nav-bar').length > 0) {
                $('#delete-button-nav-bar').remove();
            }
        }
    }    
}


/**
 * allows the user to sign out of the app
 * and changes the page accordingly
 */
ResearchForm.prototype.signOut = function() {
    // Sign out of Firebase.
    this.auth.signOut();
     this.formify();
};

/**
 *  Triggers when the auth state change for instance when the user signs-in or signs-out.
 *  this code was provided by Google.
 *  and edited to fit our needs
 */

ResearchForm.prototype.onAuthStateChanged = function(user) {
    if (user) {
        // User is signed in!
        // Get profile pic and user's name from the Firebase user object.
        var profilePicUrl = user.photoURL;
        var username = user.displayName;

        // Set the user's profile pic and name.
        this.userPic.style.backgroundImage = 'url(' + (profilePicUrl || '/images/profile_placeholder.png') + ')';

        //insert name of current researcher 
        this.username.textContent = username;
        if(getCurrentPage().includes("index")){
            prefillIndexForm();
        }
        // Show user's profile and sign-out button.
        this.username.removeAttribute('hidden');
        this.userPic.removeAttribute('hidden');
        this.signOutButton.removeAttribute('hidden');

        // Hide sign-in button.
        this.signInButton.setAttribute('hidden', 'true');

        // We save the Firebase Messaging Device token and enable notifications.
        this.saveMessagingDeviceToken();
    } else {
        // User is signed out!
        // Hide user's profile and sign-out button.
        this.username.setAttribute('hidden', 'true');
        this.userPic.setAttribute('hidden', 'true');
        this.signOutButton.setAttribute('hidden', 'true');

        // Show sign-in button.
        this.signInButton.removeAttribute('hidden');
    }
     this.formify();
};

/**
 * this will fill the following items on index page
 * -name
 * -date
 * -[geo]location
 */
function prefillIndexForm() {
            document.getElementById("nameField").value =  (Researchform.username.textContent ||"");
            document.getElementById("dateField").value = getThisDate(); 
            document.getElementById("dateTime").value = getThisTime();
        
            //insert lat,long
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position){
                    document.getElementById("locationField").value = position.coords.longitude+
                    ","+ position.coords.longitude;
                });    
            } else { 
                document.getElementById("locationField").value = "Geolocation is not supported by this browser.";
            }
}

/**
 * Future use: could be used to send notifications to users
 * Saves the messaging device token to the datastore.
 * Not currently used for anything but this could be used to send messages to all researchers 
 * Google Firebase FCM tokens for more info.
 */
ResearchForm.prototype.saveMessagingDeviceToken = function() {
    firebase.messaging().getToken().then(function(currentToken) {
        if (currentToken) {
            //console.log('Got FCM device token:', currentToken);
            // Saving the Device Token to the datastore.
            firebase.database().ref('/fcmTokens').child(currentToken).set(firebase.auth().currentUser.uid);
        } else {
            // Need to request permissions to show notifications.
            this.requestNotificationsPermissions();
        }
    }
     .bind(this)).catch(function(error) {
         //console.error('Unable to get messaging token.', error);
     });
};


/**
 * Sets up shortcuts to Firebase features,
 * initiates firebase auth,
 * and changes the page accordingly.
 */
ResearchForm.prototype.initFirebase = function() {
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();

    this.dbRootRef = firebase.database().ref().child("results");     
    this.formify();

    // Initiates Firebase auth and listen to auth state changes.
    this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};


/**
 * pushes an object to DB under results/
 * saveData(
 * {
 *      "data_pic" : "",
 *      "date" : "03/11/2017",
 *      "hab_pic" : "",
 *      "habitat" : {
 *          "a_g_2nd" : 29,
 *          "coppice" : 1,
 *          "developed" : 20,
 *          "mixed" : 10,
 *          "pine" : 20,
 *          "wetland" : 20
 *      },
 *      "habitat_notes" : "locals are present in this area",
 *      "location_point" : "113A"
 *  }
 * @param {*} param 
 */
function saveData(param){
 // var Observation = (param ||"no_Observation")
 // Researchform.dbRootRef.push(Observation);
  Researchform.dbRootRef.push(param).then(
      function(anys){
          document.getElementById("submit-status").innerHTML = "Submit uploaded: "+ param.location_point;
          document.getElementById("submit-status").focus();
      }
  );
}


/**
 * Returns true if user is signed-in. Otherwise false and displays a message.
 * Not currently used
 */
ResearchForm.prototype.checkSignedInWithMessage = function() {
    // Return true if the user is signed in Firebase

     if(this.auth.currentUser){
        document.getElementById("submit_form").style.display = "block";
     }
    else
        document.getElementById("submit_form").style.display = "none";
        document.getElementById("log_in_block").style.display = "block";

    if (this.auth.currentUser) {
        return true;
    }
    // Display a message to the user using a Toast.
    //alert("you must sign in first")
    return false;
};


var how_many_children = 0;


/**
 * Used by the search function to add new results on page
 * enter oldes/newest first could be changed here.
 * Depends on Bootstrap panels
 */

function addNewSearchResult(result_value, preview){
    var results = document.getElementById("displayResults");
    //add newer posts on top
    results.innerHTML = '  <div id="'+"result"+how_many_children +'"'+
    ' class="panel panel-primary">'+
    '<div class="panel-heading"> '+
    '<a class =" panel-title" href="./editPage.html?key='+preview.key+'">'+result_value+' </a> </div>'+
    '<div class="panel-body">'+
    "Researcher: "+ preview.name + '</br>'+
    "Date: "+ preview.date + '</br>'+
    "Point Number: "+ preview.location_point + '</br>'+
    "Start time: "+ preview.start_time + '</br>'+
    //"key: "+ preview.key + '</br>'+
    '</div>'+
    '</div>'+
    results.innerHTML ; //this is all the older posts

    how_many_children +=1;
}

/**
 * Search function used by search page:
 * Result value is the matching part
 * e.g if by name and search value = mario
 * then result value could be mario , mario vega, Mario, etc.
 * 
 * To change previewed fields add/remove from preview
 * and change on addNewSearchResult as well
 * 
 */
function searchFunction(field_name, search_value){
    how_many_children = 0;
	var ref = firebase.database().ref("results");
    ref.off();
    document.getElementById("displayResults").innerHTML ="";
    ref = firebase.database().ref("results");

    var preview = {
        "name": "",
        "date":"",
        "location_point":"",
        "start_time":""
    }
	// Attach an asynchronous callback to read the data at our posts reference
	ref.on("child_added", function(snapshot, prevChildKey) {
		var newPost = snapshot.val();
		if(newPost[field_name].toLowerCase().includes(search_value.toLowerCase()))
        {
            if(how_many_children == 0){
                document.getElementById("displayResults").innerHTML ="";
            }
            preview.date =              newPost.date;
            preview.name =              newPost.name;
            preview.location_point =    newPost.location_point;
            preview.start_time =        newPost.start_time;
            preview.key  =              snapshot.key;
            addNewSearchResult(newPost[field_name], preview);
		}else if(how_many_children == 0){
            document.getElementById("displayResults").innerHTML ="No Results";
        }
	});
}

/**
 * Attempt at search by location
 * Not used but kept for example
 */
function searchByLocation(search_value) {
    
	var rootRef = firebase.database().ref(); //rootRef, this is everything
	var locationRef = rootRef.child('location').child(search_value);
	//search anything under 'location' field that matches what the user typed
	locationRef.orderByChild("point_number"); //ordering them tentatively by point #	
};

/**
 * Attempt at search by name
 * Not used but kept for example
 */
function searchByName(search_value) {
  	
	var rootRef = firebase.database().ref(); //rootRef, this is everything
	var nameRef = rootRef.child('name').child(search_value);
	//search anything under 'name' field that matches what the user typed
	nameRef.orderByChild("point_number");
	
};

/**
 * Event handler
 * could be used to perform additional validation
 * not currently used
 */
ResearchForm.prototype.verify_submission = function() {
        alert("form submission started");
};


/**
 * Read current URL and return a string with the current page
 * i.e for index page return "index", for 
 * search return "search", and for edit return "edit"
 * if page is not known return unknown  
 */

function getCurrentPage(){
 
    if(!window.location.href.toLowerCase().includes(".htm") || window.location.href.toLowerCase().includes("index"))
        return "index";
    else if (window.location.href.toLowerCase().includes("edit"))
        return "edit";
    else if(window.location.href.toLowerCase().includes("search"))
        return "search";
      
    return "unknown";
}


//This will create the json object from the given form data
/**
 * used to obtain all the inside the form
 * on index and update page
 */
(function ($) {
    $.fn.serializeFormJSON = function () {

        var jsonArray = {};
        var serialize = this.serializeArray();
        $.each(serialize, function () {
            if (jsonArray[this.name]) {
                if (!jsonArray[this.name].push) {
                    jsonArray[this.name] = [jsonArray[this.name]];
                }
                jsonArray[this.name].push(this.value || '');
            } else {
                jsonArray[this.name] = this.value || '';
            }
        });
        return jsonArray;
    };
})(jQuery);

/**
 * submit function
 * prevents pages from reloading
 */
$('#mainForm').submit(function (e) {
    // This prevent from clearing the form after submit
    e.preventDefault();
    var data = $(this).serializeFormJSON();
    console.log(data);
    if(getCurrentPage().includes("index"))
        {
            document.getElementById("submit-status").innerHTML = "Submit scheduled for upload: "+ data.location_point;
            saveData(data); //Will push the json object to the database//will udate submit-status to uploaded after upload finishes
            document.getElementById("mainForm").reset();    //reset form
            prefillIndexForm();
            document.getElementById("submit-status").focus();
            
        }
    else if (getCurrentPage().includes("edit")){
        document.getElementById("submit-status").innerHTML = "Submit scheduled for upload: "+ data.location_point;
        updateData(getSearchKey(), data); //will update the existing value
        document.getElementById("submit-status").focus();
    }
               
    return false;   //prevent refresh
});


/**
 * timer was requested but we were unable to deliver
 */
//Timer (Maybe)
function countDown(){
    var maxTime = 3;
    var timer = new Date().getMinutes();
    console.log(timer);
}

/**
 * updates the original form on 
 * firebase db
 * two steps schedule for upload 
 * and finally upload to db 
 */
function updateData(key, data){
   // console.log("updating")
   var updateKey= Researchform.dbRootRef.child(key);
   updateKey.update(data).then(
       function(anys){
           document.getElementById("submit-status").innerHTML = "Submit uploaded: "+ data.location_point;
          document.getElementById("submit-status").focus();
       }
   );
    //console.log("updated")
};


/**
 * Used by the edit page 
 * calls funciton to 
 * fill all of the information on the page
 * key must real or error message will come up
 */

function fillForm(){
    if(location.search == "" || ! location.search.includes("key="))
        {
            document.getElementById("mainForm").innerHTML = searchPageNoIdentifiersError;
            return;
        }
        //var key =  getSearchKey();
        setFormData(getSearchKey());
        //console.log(key)
}
/**
 * Obtains the data from the DB 
 * and actually fills the page
 */

function setFormData(key){   
    try{
        firebase.database().ref('/results/' + key).once("value")
            .then(function(snapshot) {
            
            //ensure that our node actually has children
            if(!snapshot.hasChildren())
                {
                    document.getElementById("mainForm").innerHTML = searchPageNoIdentifiersError;
                    return;
                }
                snapshot.forEach(function(childSnapshot) {                

                // key will be "ada" the first time and "alan" the second time
                    var key = childSnapshot.key;
                    // childData will be the actual contents of the child
                    var childData = childSnapshot.val();
                    //write out
                    document.getElementsByName(key)[0].value = childData;
                    //console.log(key + ": "+ childData)      

                });
        });
}catch(err){
    document.getElementById("mainForm").innerHTML = searchPageNoIdentifiersError;
}
}

/**
 * looks at current url to obtain the search key 
 * example: https://bahama-oriole-app.firebaseapp.com/editPage.html?key=-KkCvD7muU27B9MeUmfl
 * the key is -KkCvD7muU27B9MeUmfl
 * the key is the id of submission on Firebase DB
 */
function getSearchKey(){
    return location.search.substr(location.search.indexOf("key=")+4);
}

/**
 * gets the date
 * date looks like:
 * 05/15/2017
 */
function getThisDate(){
    var d = new Date();
    var day = ("a.0" + d.getDate()).slice(-2)
    var month = ("a.0" + (d.getMonth() + 1)).slice(-2);
    var year = d.getFullYear();
    return "" + month + "/" + day + "/" + year; 
}

/**
 * gets the current time as of page load
 * example:
 * 17:03:09
 */
function getThisTime(){
    var d = new Date();
    var hour = d.getHours();
    var min = d.getMinutes();
    var second = d.getSeconds();
    if(second < 10){
        second = second.toString();
        second = "0"+second;
    }
    if(min < 10){
        min = min.toString();
        min = "0"+min;
    }
    if(hour < 10){
        hour = hour.toString();
        hour = "0"+hour;
    }

    return hour + ":"+ min + ":" + second; 
}

/**
 * Protype not used for cleaning the form after
 * submission
 * This is not used but could be to encapsulate the process
 */

function cleanForm(){
    $("form")(function(){
                var jsonArray = {};
        var serialize = this.serializeArray();
        $.each(serialize, function () {
             this.value = '';
        });
    });
}

/**
 * Used by the index page's menu's Download all data option
 * downloads all data from DB and asks the user to download all the data
 */

function downloadData(){
    
    var dataArray = [];
    var recordsCount = 0;

    try{
        firebase.database().ref('/results').once("value")
            .then(function(snapshot) {
            //ensure that our node actually has children
            if(!snapshot.hasChildren())
                {
                    alert("no records were found.")
                    return;
                }
                snapshot.forEach(function(childSnapshot) { 

                    var key = childSnapshot.key;
                    var childData = childSnapshot.val();

                    if(recordsCount == 0)
                    {
                        var ii = 0;
                        var mm = {};
                        Object.keys(childData).forEach(
                            function(key_id){
                              //  console.log(key_id);
                                mm[ii] =  key_id;
                                ii++;
                            }
                        );

                        dataArray[recordsCount]  = mm;
    
                         recordsCount++;
                        //console.log(Object.keys(childData));
                    }    
                    
                    childData["location"] =  '"'+childData["location"]+'"';
                    dataArray[recordsCount]  = childData; 
                    //console.log(childData);
                    //console.log(key + ": "+ childData)      
                recordsCount++;       
                });
                //middle man is needed
                 var jsonObject = JSON.stringify(dataArray);
                // console.log(dataArray);
                 var csvRes = ConvertToCSV(jsonObject);
                // console.log(csvRes);

                 //Download
                 var element = document.createElement('a');
                 element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvRes));
                 element.setAttribute('download', "all_data.csv");
                 
                 element.style.display = 'none';
                 document.body.appendChild(element);
                 
                 element.click();
                 document.body.removeChild(element);

        });
}catch(err){
    document.getElementById("mainForm").innerHTML = searchPageNoIdentifiersError;
}


}
/**
*  Creates the CSV File in an array
* JSON to CSV Converter
* by Hemant Metalia, Raghd Hamzeh
*from http://stackoverflow.com/questions/11257062/converting-json-object-to-csv-format-in-javascript
*/
function ConvertToCSV(objArray) 
{
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) 
    {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','
                line += array[i][index];
            }
        str += line + '\r\n';
    }
    return str;
}

/**
 * Most important function 
 * initializes everything
 */
$(document).ready(function() {
    window.Researchform = new ResearchForm();

});