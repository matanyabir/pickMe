$(document).ready(function ()
{
	var initGoogleMaps = function(cb){
		var API_KEY = "AIzaSyBiUK4rtu18Yi4gSpOgbdgKF7uhL9K7npQ";
		var url = "https://maps.googleapis.com/maps/api/js?key=" + API_KEY + "&language=en";
		$.ajax({
			url: url,
			jsonp: "callback",
			dataType: "jsonp",
			success: cb
		});
	};
	var onMapReady = function(){

    $cost = $("#cost");
    $("#pick_me1").click(function(){
      $.mobile.changePage( "#page2", { allowSamePageTransition:true, transition : "slide"} );
    });
    $("#pick_me2").click(function(){
      var data ={
        riders: [{
          name : "Itsik Bitsik",
          id : 456,
          origin_stop_id: 111,
          destination_stop_id: 222,
        }],
        stops:[{
          lat: 31.3,
          long: 30.09,
          name: "bla bla",
          id: 111
        },{
          lat: 32.3,
          long: 32.09,
          name: "bla2 bla2",
          id: 222
        }]
      };
      $.ajax({
        type: "POST",
        url: "http://ec2-54-77-46-23.eu-west-1.compute.amazonaws.com:5000/riders/add",
        data: data,
        //dataType: dataType,
        success: function(data){
          console.log(data)
        }
      });
      $("#popupBasic").popup("open", {});

      //alert("Your invitation has accepted. We will notice you about your pick-up location in 20 minutes");
      //$.mobile.changePage( "#page3", { allowSamePageTransition:true, transition : "slide"} );
      //$("<div>Your invitation has accepted. We will notice you about your pick-up location in 20 minutes</div>").dialog();
      //$.mobile.dialog("<div>Your invitation has accepted. We will notice you about your pick-up location in 20 minutes</div>");
    });
    $("#input2").change(function(){
      $cost.addClass("red").text("$1.2");
    });



    var center = {lat: 32.052810, lng: 34.848917};
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 15,
      center: center
    });
    var markerRider = new google.maps.Marker({
      position: center,
      icon: "assets/picmeman.gif",
      optimized:false, // <-- required for animated gif
      map: map
    });
    var getData = function() {
      $.get( "http://ec2-54-77-46-23.eu-west-1.compute.amazonaws.com:5000/riders/status", onResponse);
    };
    //getData();
	};
	initGoogleMaps(onMapReady);
});