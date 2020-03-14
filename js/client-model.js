function ClientModel() {
    public = this;
    private = public.private = {};


    private.init = function () {
        private.agent = new GpsDiffAgent();
        private.agent.onUpdate = private.handleLocationUpdate;
        private.stationId = 0;
        private.locationQueue = [];
        private.recordings = [];
        private.recording = null;
        private.setFetchTimer();
    }

    public.getStations = function () {
        return private.agent.getStations();
    }

    public.start = function (stationId) {
        private.stationId = stationId;
        private.agent.start();
    }

    public.stop = function () {
        private.agent.stop();
    }

    public.startRecording = function () {
        if (private.recording)
            public.stopRecording();

        let r = private.recording = new Recording();
        r.start = Date.now();
    }

    Object.defineProperty(public, "recordings", {
        get: () => private.recordings
    });

    public.stopRecording = function () {
        if (private.recording) {
            private.recording.end = Date.now();
            private.recordings.push(private.recording);
            private.recording = null;
        }
    }

    private.setFetchTimer = function () {
        setTimeout(private.handleFetch, 5000);
    }

    private.handleLocationUpdate = function (location) {
        private.locationQueue.unshift(location);
    }

    private.handleFetch = function () {
        if (private.stationId == 0)
            private.setFetchTimer();
        else {
            private.agent.getGpsData(private.stationId, (new Date(Date.now() - 6000)).toUTCString())
                .then(
                response => {
                    try {
                        let gps = response.Data;
                        if (gps.length > 0) {
                            let lq = private.locationQueue;

                            for (let i = lq.length - 1; i >= 0; i--) {
                                let loc = lq[i];
                                let closest = 1000000000;
                                let gpsIndex = -1;
                                for (let j = 0; j < gps.length; j++) {
                                    let g = gps[j];
                                    let gWhen = new Date(g.When);
                                    gWhen = Date.UTC(gWhen.getFullYear(), gWhen.getMonth(), gWhen.getDate(), gWhen.getHours(), gWhen.getMinutes(), gWhen.getSeconds());
                                    let diff = Math.floor((gWhen - loc.When) / 1000);
                                    console.log(`Diff=${diff} ${gWhen} ${loc.When}`);
                                    if (diff >= 0 && diff < closest) {
                                        closest = diff;
                                        gpsIndex = j;
                                    }

                                    if (diff === 0)
                                        break;
                                }

                                if (gpsIndex !== -1) {
                                    let selGps = gps[gpsIndex];
                                    loc.LatitudeDelta = selGps.LatitudeDelta;
                                    loc.LatitudeAdjusted = loc.Latitude + selGps.LatitudeDelta;
                                    loc.LongitudeDelta = selGps.LongitudeDelta;
                                    loc.LongitudeAdjusted = loc.Longitude + selGps.LongitudeDelta;
                                    loc.AltitudeDelta = loc.AltitudeDelta;
                                    loc.AltitudeAdjusted = loc.AltitudeAdjusted + selGps.AltitudeAdjusted;
                                    lq.splice(i, 1);

                                    // add to recording
                                    if (private.recording)
                                        private.recording.points.push(loc);

                                    if (public.onUpdate) {
                                        try {
                                            public.onUpdate(loc);
                                        }
                                        catch (ex) {
                                            // swallow the errors from outside
                                        }
                                    }
                                }
                            }
                        }
                        else
                            console.log(`No gps data was retrieved for station ${private.stationId}`);
                    }
                    finally {
                        private.setFetchTimer();
                    }
                },
                respones => {
                    console.error(`Unable to fetch gps data. ${response.status}:${response.statusText}`); 
                    private.setFetchTimer();
                }
                );
        }


    }

    private.init();

}

function Recording() {
    var public = this;
    public.start = null;
    public.end = null;
    public.points = [];
    public.distance = function (useAdjusted) {
        let dist = 0;
        let p = public.points;
        if (p.length == 0)
            return 0;

        let lastGps = p[0];
        for (let i = 1; i < p.length; i++) {
            let gps = p[i];
            let lat1, long1, lat2, long2;
            if (useAdjusted) {
                lat1 = lastGps.LatitudeAdjusted;
                long1 = lastGps.LongitudeAdjusted;
                lat2 = gps.LatitudeAdjusted;
                long2 = gps.LongitudeAdjusted;
            }
            else {
                lat1 = lastGps.Latitude;
                long1 = lastGps.Longitude;
                lat2 = lastGps.Latitude;
                long2 = lastGps.Longitude;
            }
            dist += GeoUtils.distance(lat1, long1, lat2, long2);
            lastGps = gps;
        }

        return dist;
    }
}