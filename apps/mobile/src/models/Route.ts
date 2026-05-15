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
  private currentCheckPointIndex: number = 0;

  constructor(
    id: string,
    start: { latitude: number; longitude: number },
    distance: number
  ) {
    this.id = id;
    this.start = start;
    this.distance = distance;
  }

  getCurrentCheckpoint(): Checkpoint | null {
    if (this.currentCheckPointIndex >= this.checkpoints.length) return null;
    return this.checkpoints[this.currentCheckPointIndex];
  }

  tryCompleteCurrentCheckpoint(userLocation: {
    latitude: number;
    longitude: number;
  }): boolean {
    const current = this.getCurrentCheckpoint();
    if (!current) return false;

    const completed = current.checkComplited(userLocation);
    if (completed) {
      this.currentCheckPointIndex++;
    }
    return completed;
  }

  isFinished(): boolean {
    return this.currentCheckPointIndex >= this.checkpoints.length;
  }
}
