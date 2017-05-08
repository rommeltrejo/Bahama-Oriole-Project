/***************************************************************************************************
* File: main.js
* Date: 05/02/2017
* Authors: Andrew Maddox, Krunal Hirpara, Rommel Trejo, Lillian Lam, Sarah Newkirk, Sherwing Fong    
* Project: Bahama Oriole Application
* Description: This file 
* 		 
*
*****************************************************************************************************/
'use strict';

var searchPageNoIdentifiersError = '<div class="alert alert-danger"><strong>Warning!</strong></br>No or wrong submission ID passed.</br> '+
        "The record might no longer exist in the database or you arrived at this page by mistake.</br>"+
        "Please try searching again and clicking on the submission you wish to edit</div>";

// Initializes ResearchForm.
function ResearchForm() {
    if(getCurrentPage().includes("unknown")){
        $("body").remove();
        return;
    }else{
        console.log("Current page: "+ getCurrentPage());
    }
        

    this.submitButton = document.getElementsByClassName("btn btn-primary");
    this.userPic = document.getElementById('user-pic');
    this.username = document.getElementById('user-name');
    this.signInButton = document.getElementById('sign-in');
    this.signOutButton = document.getElementById('sign-out');

    this.checkSetup();
    this.initFirebase();

    this.signOutButton.addEventListener('click', this.signOut.bind(this));
    this.signInButton.addEventListener('click', this.signIn.bind(this));

    if(getCurrentPage().includes("edit"))
        fillForm();
    /*
 // Saves message on form submit.
     this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
 // Toggle for the button.
 this.messageInput.addEventListener('keyup', buttonTogglingHandler);
 this.messageInput.addEventListener('change', buttonTogglingHandler);

 ;*/

}


//##############################            useful

// Checks that the Firebase SDK has been correctly setup and configured.
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

// Signs-in Friendly Chat.
ResearchForm.prototype.signIn = function() {
    // Sign in Firebase using popup auth and Google as the identity provider.
    var provider = new firebase.auth.GoogleAuthProvider();
    this.auth.signInWithPopup(provider);

    this.formify();

}
;

ResearchForm.prototype.formify =  function(){
    if(this.auth.currentUser)
        document.getElementById("submit_form").className = "container"
    else{
        if(getCurrentPage().includes("search"))
            document.getElementById("displayResults").innerHTML ="";
        document.getElementById("submit_form").className = "hidden"
    }
        
}


// Signs-out of Friendly Chat.
ResearchForm.prototype.signOut = function() {
    // Sign out of Firebase.
    this.auth.signOut();
    
     this.formify();
}
;

// Triggers when the auth state change for instance when the user signs-in or signs-out.
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

}
;

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

//future use: could be used to send notifications to users
// Saves the messaging device token to the datastore.
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

// Sets up shortcuts to Firebase features and initiate firebase auth.
ResearchForm.prototype.initFirebase = function() {
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();

    this.initDataGetters();
    
     this.formify();


    // Initiates Firebase auth and listen to auth state changes.
    this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
}
;

ResearchForm.prototype.initDataGetters = function() {
    this.dbRootRef = firebase.database().ref().child("results"); 
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
  Researchform.dbRootRef.push(param);
}

// Returns true if user is signed-in. Otherwise false and displays a message.
ResearchForm.prototype.checkSignedInWithMessage = function() {
    // Return true if the user is signed in Firebase

     if(this.auth.currentUser)
        document.getElementById("submit_form").className = "container"
    else
        document.getElementById("submit_form").className = "hidden"

    if (this.auth.currentUser) {
        return true;
    }
    // Display a message to the user using a Toast.
    //alert("you must sign in first")
    return false;
}
;

var sampleResult = "<button>"
var secondPart =  "</button> </br>"

var how_many_children = 0;

// Result value is the matching part
//e.g if by name and search value = mario
//then result value could be mario , mario vega, Mario, etc.

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
    "Location: "+ preview.location_point + '</br>'+
    "Start time: "+ preview.start_time + '</br>'+
    //"key: "+ preview.key + '</br>'+
    '</div>'+
    '</div>'+
    results.innerHTML ; //this is all the older posts

    how_many_children +=1;
}


function searchFunction(field_name, search_value){
  
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
            preview.date =              newPost.date;
            preview.name =              newPost.name;
            preview.location_point =    newPost.location_point;
            preview.start_time =        "6:00 pm";
            preview.key  =              snapshot.key;
            addNewSearchResult(newPost[field_name], preview);
		}
	});
}

//NEED A GENERAL GETDATA FUNCTION!!!
// Query functions for searchPage.html
function searchByLocation(search_value) {
    
	var rootRef = firebase.database().ref(); //rootRef, this is everything
	var locationRef = rootRef.child('location').child(search_value);
	//search anything under 'location' field that matches what the user typed
	locationRef.orderByChild("point_number"); //ordering them tentatively by point #
	
};

function searchByName(search_value) {
  	
	var rootRef = firebase.database().ref(); //rootRef, this is everything
	var nameRef = rootRef.child('name').child(search_value);
	//search anything under 'name' field that matches what the user typed
	nameRef.orderByChild("point_number");
	
};

ResearchForm.prototype.verify_submission = function() {
        alert("form submission started");
};

$(document).ready(function() {
    window.Researchform = new ResearchForm();

});

// Read current URL and return a string with the current page
//i.e for index page return "index", for 
//search return "search", and for edit return "edit"
function getCurrentPage(){
 
    if(!window.location.href.toLowerCase().includes(".htm") || window.location.href.toLowerCase().includes("index"))
        return "index";
    else if(window.location.href.toLowerCase().includes("search"))
        return "search";
    else if (window.location.href.toLowerCase().includes("edit"))
        return "edit";
    

    return "unknown";
}


//This will create the json object from the given form data
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

$('#mainForm').submit(function (e) {
    // This prevent from clearing the form after submit
    //e.preventDefault();
    var data = $(this).serializeFormJSON();
    console.log(data);
    if(getCurrentPage().includes("index"))
        {
            saveData(data); //Will push the json object to the database
                var p1 = new Promise( (resolve, reject) => {
                    setFormData("Clean_Copy");
                    resolve('Success!');
            } );
            
            p1.then(prefillIndexForm())
            ; //this cleans the form after submission
        
        }
    else if (getCurrentPage().includes("edit"))
        updateData(getSearchKey(), data); //will update the existing value

    return false;
});

//Timer (Maybe)
function countDown(){
var maxTime = 3;
var timer = new Date().getMinutes();

console.log(timer);
}

function updateData(key, data){
   // console.log("updating")
   var updateKey= Researchform.dbRootRef.child(key);
   updateKey.update(data);
    //console.log("updated")
};


function fillForm(){
    if(location.search == "" || ! location.search.includes("key="))
        {
            document.getElementById("mainForm").innerHTML = searchPageNoIdentifiersError;
            return;
        }

        //var key =  getSearchKey();
        setFormData(getSearchKey());
        //console.log(key)


//fix buttons because they break for no reason I know
$('#theVeryFirstGroup').attr('data-target','#obs1');
$('#theVerySecondGroup').attr('data-target','#obs2');

}

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
 resolve('Success!');
}

function getSearchKey(){
    return location.search.substr(location.search.indexOf("key=")+4);
}

function getThisDate(){
    var d = new Date();
    var day = ("a.0" + d.getDate()).slice(-2)
    var month = ("a.0" + (d.getMonth() + 1)).slice(-2);
    var year = d.getFullYear();
    return "" + month + "/" + day + "/" + year; 
}

function getThisTime(){
    var d = new Date();
    var hour = d.getHours();
    var min = d.getMinutes();
    var second = d.getSeconds();

    return hour + ":"+ min + ":" + second; 
}

function cleanForm(){
    $("form")(function(){
                var jsonArray = {};
        var serialize = this.serializeArray();
        $.each(serialize, function () {
             this.value = '';
        });
     
    });
}

