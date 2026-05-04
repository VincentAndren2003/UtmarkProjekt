import { Request, Response } from 'express';
import { Route } from '../models/Route';

export const generateRouteController = async (req: Request, res: Response) => {
    try {
        const { id, start, distance } = req.body;
        
        const newRoute = new Route(id, start, distance);
        const checkpoints = newRoute.setCheckpoints();

        res.status(200).json({
            id: newRoute.id,
            start: newRoute.start,
            distance: newRoute.distance,
            checkpoints: checkpoints
        });
    } catch (error) {
        console.error("Error generating route:", error);
        res.status(500).json({ message: "Rutt kunde inte genereras" });
    }
};