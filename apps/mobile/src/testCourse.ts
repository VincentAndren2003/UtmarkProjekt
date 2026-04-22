export const TEST_COURSE = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [18.161345832564905, 59.28992782384871], // Start
          [18.167132635232818, 59.289336641852344], // Control 1
          [18.159692935372995, 59.2862579140567], // Control 2
          [18.156246529926673, 59.29060978989479]  // Finish
        ]
      },
      properties: { type: "route-line" }
    },
    // Start
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [18.161345832564905, 59.28992782384871] },
      properties: { type: "start" }
    },
    // Control 1
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [18.167132635232818, 59.289336641852344] },
      properties: { type: "control", number: "1" }
    },
    // Control 2
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [18.159692935372995, 59.2862579140567] },
      properties: { type: "control", number: "2" }
    },
    // The Finish
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [18.156246529926673, 59.29060978989479] },
      properties: { type: "finish" }
    }
  ]
};