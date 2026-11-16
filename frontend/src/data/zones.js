// Direction zones and rule settings for each camera (Cameras & zones page).
// Zone boxes are in percent of the still image. direction: 'up' or 'down' = allowed direction.
// countingLines: y position (percent) of each horizontal line used to count vehicles.
export const cameraSetups = {
  'CAM-01': {
    zones: [{ x: 20.5, y: 32.3, w: 26, h: 66.4, direction: 'up' }],
    countingLines: [],
    settings: defaultSettings(),
  },
  'CAM-02': {
    zones: [
      { x: 14.1, y: 32.3, w: 34.4, h: 66.4, direction: 'up' },
      { x: 51, y: 32.3, w: 34.4, h: 66.4, direction: 'down' },
    ],
    countingLines: [],
    settings: defaultSettings(),
  },
  'CAM-03': {
    zones: [],
    countingLines: [70],
    settings: { ...defaultSettings(), wrongWay: false },
  },
  'CAM-04': {
    zones: [{ x: 51, y: 32.3, w: 34.4, h: 66.4, direction: 'down' }],
    countingLines: [],
    settings: defaultSettings(),
  },
}

function defaultSettings() {
  return {
    framesBeforeAlert: 5,
    toleranceDegrees: 100,
    minConfidence: 0.5,
    wrongWay: true,
    noHelmet: true,
    tripleRiding: true,
    vehicleCounting: true,
  }
}
