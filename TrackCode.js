  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-9316500-9', 'auto');
  ga('send', 'pageview');

function userCheckIn(){
	var uid = getLocalStorageStuff("id");
	document.title += " @ " + uid;
}

function getLocalStorageStuff(a){
  b = localStorage.getItem(a);
  if(b == null){
    if(a == "id"){
      localStorage.setItem(a, makeNewUserID());
    }else{
      localStorage.setItem(a, 0);
    }
  }
  return localStorage.getItem(a);
}

function makeNewUserID(){
	return new Date().getTime().toString();
}

userCheckIn();
  
var TrackCode_Last_Modify_Date = "Mon Dec 8 20:03:40 SGT 2014";
