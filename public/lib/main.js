'use strict';

// Initializes ResearchForm.
var test = {};

function ResearchForm() {

    this.submitButton = document.getElementsByClassName("btn btn-primary");
    this.userPic = document.getElementById('user-pic');
    this.username = document.getElementById('user-name');
    this.signInButton = document.getElementById('sign-in');
    this.signOutButton = document.getElementById('sign-out');

    this.checkSetup();
    this.initFirebase();

    this.signOutButton.addEventListener('click', this.signOut.bind(this));
    this.signInButton.addEventListener('click', this.signIn.bind(this));

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

}
;

// Signs-out of Friendly Chat.
ResearchForm.prototype.signOut = function() {
    // Sign out of Firebase.
    this.auth.signOut();
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

        test.userpic = this.userPic;

        this.username.textContent = username;

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
}
;

//future use: could be used to send notifications to users
// Saves the messaging device token to the datastore.
ResearchForm.prototype.saveMessagingDeviceToken = function() {
    firebase.messaging().getToken().then(function(currentToken) {
        if (currentToken) {
            console.log('Got FCM device token:', currentToken);
            // Saving the Device Token to the datastore.
            firebase.database().ref('/fcmTokens').child(currentToken).set(firebase.auth().currentUser.uid);
        } else {
            // Need to request permissions to show notifications.
            this.requestNotificationsPermissions();
        }
    }
    .bind(this)).catch(function(error) {
        console.error('Unable to get messaging token.', error);
    });
}
;

// Sets up shortcuts to Firebase features and initiate firebase auth.
ResearchForm.prototype.initFirebase = function() {
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();

    this.initDataGetters();

    // Initiates Firebase auth and listen to auth state changes.
    this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
}
;

ResearchForm.prototype.initDataGetters = function() {
    this.dbRootRef = firebase.database().ref().child("results"); 
};

function savedata(param){
  var message = (param ||"lelelle")

  Researchform.dbRootRef.push({fieldName:'messageField', text:message});
  
}


// Returns true if user is signed-in. Otherwise false and displays a message.
ResearchForm.prototype.checkSignedInWithMessage = function() {
    // Return true if the user is signed in Firebase
    if (this.auth.currentUser) {
        return true;
    }
    // Display a message to the user using a Toast.
    alert("you must sign in first")
    return false;
}
;

// Requests permissions to show notifications.
ResearchForm.prototype.requestNotificationsPermissions = function() {
    console.log('Requesting notifications permission...');
    firebase.messaging().requestPermission().then(function() {
        // Notification permission granted.
        this.saveMessagingDeviceToken();
    }
    .bind(this)).catch(function(error) {
        console.error('Unable to get permission to notify.', error);
    });
}
;

// Query functions for searchPage.html
ResearchForm.prototype.getData = function(valz) {
    var ref = firebase.database().ref('results/');

    ref.orderByChild("name").on("child_added", function(data) {
        console.log(data.val().name)
    });
    //   ref.on("value", function(snapshot) {
    //    console.log(snapshot.val().results[1][valz]    );
    // }, function (error) {
    //    console.log("Error: " + error.code);
    // });

};

ResearchForm.prototype.verify_submission = function() {
        alert("form submission started");
};

$(document).ready(function() {
    window.Researchform = new ResearchForm();
});

