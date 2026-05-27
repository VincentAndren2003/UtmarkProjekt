import { Checkpoint } from './Checkpoint';

export class Route {
  // slut koridnater ? // antal checkpoints?
  id: string;
  start: {
    latitude: number;
    longitude: number;
  };
  distance: number; // km t.ex 2, 5, 10
  checkpoints: Checkpoint[] = [];
  currentCheckPointIndex: number;

  constructor(
    id: string,
    start: { latitude: number; longitude: number },
    distance: number,
    currentCheckPointIndex: number
  ) {
    this.id = id;
    this.start = start;
    this.distance = distance;
    this.currentCheckPointIndex = currentCheckPointIndex;
  }

  getCurrentCheckpoint(): Checkpoint | null {
    if (this.currentCheckPointIndex >= this.checkpoints.length) return null;
    return this.checkpoints[this.currentCheckPointIndex];
  }

  tryCompleteCurrentCheckpoint(userLocation: {
    latitude: number;
    longitude: number;
  }, fetchRadius: number): boolean {
    const current = this.getCurrentCheckpoint();
    if (!current) return false;

    const completed = current.checkComplited(userLocation, fetchRadius);
    if (completed) {
      this.currentCheckPointIndex++;
    }
    return completed;
  }

  isFinished(): boolean {
    return this.currentCheckPointIndex >= this.checkpoints.length;
  }
}
