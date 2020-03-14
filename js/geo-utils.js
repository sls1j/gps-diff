function GeoUtilsConstructor() {
    var public = this;
    var private = public.private = {};
    var consts = public.consts = Object.freeze({
        EarthRadius : 6371.0 * 1000 // in meters
    });

    /** return the distance between gps coordinates in meters
     * @param {number} lat1 - Latitude of the first point
     * @param {number} long1 - Longitude of the first point
     * @param {number} lat2 - Latitude of the second point
     * @param {number} long2 - Longiduate of the second point
     * @returns {number} - The distance between point 1 and point 2 in meters
     */
    public.distance = function (lat1, long1, lat2, long2) {

        function toRads(deg) {
            return deg * Math.PI / 180.0;
        }

        lat1 = toRads(lat1);
        long1 = toRads(long1);
        lat2 = toRads(lat2);
        long2 = toRads(long2);

        var dLat = (lat2 - lat1);
        var dLon = (long2 - long1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var distance = consts.EarthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return distance;
    }
}

var GeoUtils = new GeoUtilsConstructor();