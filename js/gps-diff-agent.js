
/// <reference path="geo-utils.js"/>

function GpsDiffAgent() {
    var public = this;
    var private = public.private = {};

    if (window.location.hostname === "localhost" || window.location.host === "")
        private.url = "http://localhost:54431/API/";
    else
        private.url = window.location.protocol + "//" + (window.location.host || "localhost:54431") + "/API/";

    private.locationListener = function (position) {
        let date = new Date(position.timestamp);
        var p = position.coords;
        var addStation = {
            "StationId": 0,
            "When": date,
            "Latitude": p.latitude,
            "Longitude": p.longitude,
            "Altitude": p.altitude,
            "Accuracy": p.accuracy,
            "AltitudeAccuracy": p.altitudeAccuracy
        };
        console.log(addStation);

        if (public.onUpdate)
            public.onUpdate(addStation);
    }



    private.sendCommand = function (method, name, body) {
        return new Promise(function (resolve, reject) {
            let dest = private.url + name;
            var xhr = new XMLHttpRequest();
            //xhr.responseType = "json";
            xhr.open(method, dest);
            xhr.onload = function () {
                console.log("received response");
                if (this.status >= 200 && this.status < 300) {
                    let response = JSON.parse(xhr.response)
                    resolve(response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };

            if (method === 'POST') {
                xhr.setRequestHeader('Content-Type', 'application/json');
                let data = JSON.stringify(body);
                console.log(dest, " ", name, " ", data);
                xhr.send(data);
            }
            else {
                console.log(dest, " ", name);
                xhr.send();
            }
        });
    }

    public.start = function () {
        if (private.collect)
            return;

        private.collect = true;
        private.watcher = navigator.geolocation.watchPosition(private.locationListener,
            function (error) {
            },
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 });
    }

    public.stop = function () {
        if (!private.collect)
            return;

        private.collect = false;
        navigator.geolocation.clearWatch(private.watcher);
        private.watcher = null;
    }

    public.addAgentData = function (addStation) {
        return private.sendCommand("POST", "AddStationData", addStation);
    }

    public.getStations = function () {
        return private.sendCommand("GET", "GetStations");
    }

    public.getGpsData = function (stationId, oldestTime) {
        return private.sendCommand("POST", "GetGpsData", { Stations: [stationId], StartTime: oldestTime });
    }

    public.onUpdate = null;
}