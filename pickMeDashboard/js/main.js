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

    var r1,r2, waiting, driving=0;
    var time = 300;
    var tick = 60000;
    var $time = $("#time");
    var $ff_title = $("#ff_title");
    var $waiting_c = $("#waiting_c");
    var $cost_c = $("#cost_c");
    var $pending_c = $("#pending_c");
    var $driving_v_c = $("#driving_v_c");
    var $driving_c = $("#driving_c");
    var $panel = $("#panel");
    var timer;
    var formatTime = function(t) {
      var m = t % 60;
      if (m < 10)
        m = "0" + m;
      var h = Math.floor(t / 60) % 24;
       return h + ":" + m;
    };
    var drivingBuses = {};
    var moveBus = function(busId, route) {
      item = route.route.shift();
      if (!item) {
        if (drivingBuses[busId]) {
          drivingBuses[busId] = null;
          if (busId == 1) {
            $driving_v_c.text("1");
            $pending_c.text("1");
          } else {
            $driving_v_c.text("0");
            $pending_c.text("2");
          }
        }
        return;
      }
      drivingBuses[busId] = true;
      var newPos = new google.maps.LatLng(item.lat, item.lng);
      buses[busId].setPosition(newPos);
      if (item.pick) {
        waiting--;
        driving++;
        $waiting_c.text(waiting);
        $driving_c.text(driving);
        riders[item.pick].setMap(null);
      }
      if (item.drop) {
        driving--;
        $driving_c.text(driving);
        if (busId == 2)
          stops[item.drop].setMap(null);
      }
    };

    var counter = 0;
    var onTick = function() {
      if (time === 300) { // 05:00
        onResponse(DATA1);
      } else if (time === 360) { // 06:00 - matanya
        onResponse(DATA2);
      } else if (time === 420) { // 07:00 - eran
        onResponse(DATA3);
      } else if (time === 480) { // 8:00
        onResponse(DATA4);
      } else if (time > 490) { // 08:10 b1
        moveBus(1, r1);
        if (counter == 0) {
          counter++;
          $pending_c.text(1);
          $driving_v_c.text(1);
        }
      }
      if (time > 505) { // 08:25 b2
        moveBus(2, r2);
        if (counter == 1) {
          counter++;
          $pending_c.text(0);
          $driving_v_c.text(2);
        }
      }
      $time.text(formatTime(time));
      time++;
      timer = setTimeout(onTick, tick);
    };
    setTimeout(onTick,0);
    $("#ff_button").click(function(){
      var text;
      if (tick === 60000){
        $panel.addClass("clicked");
        tick = 1000;
        text = "X 60";
      }
      else if (tick === 1000){
        tick = 100;
        text = "X 600";
      }
      else {
        $panel.removeClass("clicked");
        tick = 60000;
        text = "";
      }
      clearTimeout(timer);
      onTick();
      $ff_title.text(text);
    });



    var center = {lat: 32.052810, lng: 34.848917};
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 13,
      center: center
    });
    var riders = {};
    var buses = {};
    var stops = {};
    var data_updated;
    var onResponse = function(data) {
      if (data.r1) {
        r1 = data.r1;
        r2 = data.r2;
        return;
      }

      //if (data.status === "pending")
      //{
      //  setTimeout(getData, 3000);
      //}
      //if (data_updated === data.data_updated)
      //  return;
      waiting = data.riders.length;
      $waiting_c.text(waiting);
      $pending_c.text(data.buses.length);
      $cost_c.text("37,16" + data.riders.length);
      data_updated = data.data_updated;
      indexedStops = _.indexBy(data.stops, "id");
      data.buses.map(function(bus){
        if (buses[bus.id])
          return;
        var pos = {
          lat: bus.lat,
          lng: bus.long
        };
        var markerBus = new google.maps.Marker({
          position: pos,
          icon: "assets/bus.png",
          //optimized:false, // <-- required for animated gif
          map: map
        });
        buses[bus.id] = markerBus;
      });
      data.riders.map(function(rider){
        if (riders[rider.id])
          return;
        var origin = indexedStops[rider.origin_stop_id];
        var dest = indexedStops[rider.destination_stop_id];
        var pos = {
          lat: dest.lat,
          lng: dest.long
        };
        if (!stops[dest.id]) {
          var markerStop = new google.maps.Marker({
            position: pos,
            title: dest.name,
            icon: "assets/mark.png",
            //optimized:false, // <-- required for animated gif
            map: map
          });
          stops[dest.id] = markerStop;
        }
        pos = {
          lat: origin.lat,
          lng: origin.long
        };
        var markerRider = new google.maps.Marker({
          position: pos,
          title: rider.name,
          icon: "assets/picmeman.gif",
          optimized:false, // <-- required for animated gif
          map: map
        });
        riders[rider.id] = markerRider;
        var contentString = '<div id="content">'+
          '<div id="siteNotice">'+
          '</div>'+
          '<h1 class="firstHeading">' + rider.name + '</h1>'+
          '<div id="bodyContent">'+
          '<div>from <span class="bold">' + origin.name + '</span> to <span class="bold">' + dest.name + '</span></div>';
        if (rider.start_time) {
          contentString +=
            '<div>deprature time: <span class="bold">' + formatTime(rider.start_time) + '</span></div>';
        }
        if (rider.end_time) {
          contentString +=
            '<div>arrive time: <span class="bold">' + formatTime(rider.end_time) + '</span></div>';
        }
        contentString +=
          '</div>'+
          '</div>';
        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });
        markerRider.addListener('click', function() {
          infowindow.open(map, markerRider);
        });


      });

    };

    //var getData = function() {
    //  $.get( "http://ec2-54-77-46-23.eu-west-1.compute.amazonaws.com:5000/riders/status", onResponse);
    //};
    //getData();
	};
	initGoogleMaps(onMapReady);
});