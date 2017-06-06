/**
Components are re-usable codes for specific purpose.

@File - HomePage component. Home screen with current navigation path displayed over google map.

@Author - Anusree, June 05/2017
*/
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

declare var $: any;//Jquery $ variable
declare var google:any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
    private map:any;
    private line_coords:any;
    private current_lat:any;
    private current_lon:any;
    private allMarkers:any;
    private location_watch_id:any;

    
    constructor(public navCtrl: NavController) {
        //Initialize values
        this.line_coords = [];
        this.allMarkers = [];
        this.current_lat = null;
        this.current_lon = null;
        this.location_watch_id = null;
    }   
    
    geoFetchFailure(error) {
        // Could not obtain location
        alert("location fetch failed, "+error.message);
        console.log('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }
    
    //Plot the navigation path from the location co-ords obtained after watching location change
    drawNavigationPath(latitude,longitude) {              
        //Add to the line_coords array, used for drawing the navigation path
        let lat = latitude;
        let long = longitude;
        
        //This code block is for test purpose with dynamically adding values to co-ords
        /*lat = latitude+0.0001;
        long = longitude+0.001;
        
        //Re-assigning the value for test purpose. Refer trackUserCoordinates 
        this.current_lat = latitude+0.0001;
        this.current_lon = longitude+0.001;*/
        
        let lat_lng = new google.maps.LatLng(lat,long);
        this.line_coords.push(lat_lng);
        console.log("line coords",lat,long);
        
        //Remove previous marker
        this.allMarkers.map((marker:any,idx:number)=> {
            marker.setMap(null);
            
            if(idx+1 == this.allMarkers.length) {
                this.allMarkers = [];
            }
        });
        
         //Mark the current position of the user
         var latLngMarker = new google.maps.Marker({
            position: lat_lng,
            map: this.map
         });
        
        //This is used to clear the previous position marker of the user
        this.allMarkers.push(latLngMarker);

        //Draw path by joining co-ords
        var lineCoordinatesPath = new google.maps.Polyline({
            path: this.line_coords,
            geodesic: true,
            strokeColor: '#2E10FF'
        });

        lineCoordinatesPath.setMap(this.map);
    }
    
    //Load the google map on app load and marks the current position of the user
    initialiseGoogleMap() {
        if( navigator.geolocation )
        {
            // Call getCurrentPosition with success and failure callbacks
            navigator.geolocation.getCurrentPosition( (position)=> {
                if(position.coords.latitude!= null) {
                    this.current_lat = position.coords.latitude;
                    this.current_lon = position.coords.longitude;
                    console.log("lat, log",position.coords.latitude,position.coords.longitude);

                    if(typeof google === 'object' && typeof google.maps === 'object') {
                        let latitude = this.current_lat;
                        let longitude = this.current_lon;

                        this.map = new google.maps.Map(document.getElementById('g-map'), {
                            zoom: 15,
                            center: new google.maps.LatLng( latitude,longitude),
                            mapTypeId: 'roadmap'
                        });

                        //Current position of the user
                        let lat_lng = new google.maps.LatLng(this.current_lat,this.current_lon);
                        this.line_coords.push(lat_lng);
                        
                        var latLngMarker = new google.maps.Marker({
                            position: lat_lng,
                            map: this.map
                        });
                        
                        //This is used to clear the previous position of the user
                        this.allMarkers.push(latLngMarker);

                        //Responsive map
                        new google.maps.event.addDomListener(window, "resize", () => {
                            var center = this.map.getCenter();
                            google.maps.event.trigger(this.map, "resize");
                            this.map.setCenter(center); 
                        }); 

                    } else {
                        alert("google is not defined");
                    } 
                }          
            }, this.geoFetchFailure,{ enableHighAccuracy: true });
        }
        else
        {
            alert("GMap Initialize - Sorry, your device does not support geolocation services.");
        }       
    }
    
    //geolocation watchPosition is instantiated
    trackUserCoordinates() {
        if( navigator.geolocation )
        {       
             //Throw error if no update is received every 30 seconds.
            this.location_watch_id = navigator.geolocation.watchPosition( (position)=>{
                if(position.coords.latitude!= null) {
                    //For testing purpose with auto incrementing co-ords, comment the below 2 line of code
                    this.current_lat = position.coords.latitude;
                    this.current_lon = position.coords.longitude;
                    
                    console.log("trackUserCoordinates lat, log",this.current_lat,this.current_lon);
                    
                     //draw the navigation path
                    this.drawNavigationPath(this.current_lat,this.current_lon);
                }}, this.geoFetchFailure, { timeout: 30000, enableHighAccuracy: true });
        }
        else
        {
            console.log("Sorry, your device does not support geolocation services.");
        }              
    }    
    
    //Start user tracking when the Start Patrol is clicked
    startPatrol() {
        this.trackUserCoordinates();
    }
    
    //Stop user tracking when the Stop Patrol is clicked
    stopPatrol() {
        console.log("location_watch_id",this.location_watch_id);
        if(this.location_watch_id != null && navigator.geolocation) {
            navigator.geolocation.clearWatch(this.location_watch_id);
        } else {
            console.log("Can not clear Patrol, your device does not support geolocation services");
        }
    }
    
    //Function is called after page load
    ngAfterContentInit() {
        //Loads the google map
        this.initialiseGoogleMap();
    }
}
