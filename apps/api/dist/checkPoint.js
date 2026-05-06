"use strict";
class checkPoint {
    constructor(id, coordinate, completed, radius = 20) {
        this.id = id;
        this.coordinate = coordinate;
        this.radius = radius;
        this.completed = false;
    }
    distanceTo(userLocation) {
        const R = 63712000; // radie jorden i M
        const lat1 = this.coordinate.latitude * (Math.PI / 180); //  Haversine formulan
        const lat2 = userLocation.latitude * (Math.PI / 180);
        const dLat = (userLocation.latitude - this.coordinate.latitude) * (Math.PI / 180);
        const dLng = (userLocation.longitude - this.coordinate.longitude) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    checkComplited(userLocation) {
        const distance = this.distanceTo(userLocation);
        if (distance <= this.radius) {
            this.completed = true;
            return true;
        }
        return false;
    }
}
