"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const checkPoint_1 = require("./checkPoint");
class Route {
    constructor(id, start, distance) {
        this.checkpoints = [];
        this.id = id;
        this.start = start;
        this.distance = distance;
    }
    setCheckpoints(numCeckpoints = this.distance * 2, bearing = 0, checkpointRadius = 20) {
        this.checkpoints = [];
        const distancePerCheckpoint = this.distance / numCeckpoints;
        let currentPos = {
            latitude: this.start.latitude,
            longitude: this.start.longitude,
        };
        for (let i = 1; i <= numCeckpoints; i++) {
            bearing = Math.random() * 360; // Rikting på nästa checkpoint, helt slumpad
            //bearing += (Math.random()* 40 - 20) // Om snirklar åt samma håll
            const newCheckPoint = this.calculateCheckpoint(`checkpoint-${i}`, currentPos, distancePerCheckpoint, bearing, checkpointRadius);
            this.checkpoints.push(newCheckPoint);
            currentPos = {
                latitude: newCheckPoint.coordinate.latitude,
                longitude: newCheckPoint.coordinate.longitude,
            };
        }
        return this.checkpoints;
    }
    calculateCheckpoint(id, origin, distanceKm, bearing, radius) {
        const R = 6371; //jorden i km
        const bearingRad = (bearing * Math.PI) / 180;
        const lat1 = (origin.latitude * Math.PI) / 180;
        const long1 = (origin.longitude * Math.PI) / 180;
        const angularDistance = distanceKm / R;
        const lat2 = Math.asin(Math.sin(lat1) * Math.cos(angularDistance) +
            Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad));
        const long2 = long1 +
            Math.atan2(Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1), Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2));
        const coordinate = {
            latitude: (lat2 * 180) / Math.PI,
            longitude: (long2 * 180) / Math.PI,
        };
        return new checkPoint_1.checkPoint(id, coordinate, false, radius);
    }
}
exports.Route = Route;
