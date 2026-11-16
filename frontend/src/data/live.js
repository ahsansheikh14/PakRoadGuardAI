// What each camera's edge device is sending right now.
// Boxes are in percent of the frame: x, y = top-left corner, w, h = size.
// kind: 'vehicle' (blue) | 'violation' (orange) | 'helmet' (green)
export const liveFeeds = {
  'CAM-01': {
    time: '14 Nov 2026 · 10:42:16',
    vehiclesInView: 5,
    zones: [{ label: 'Zone A · allowed ↑', x: 20.5, y: 34, w: 26, h: 66 }],
    detections: [
      { kind: 'vehicle', label: 'Bike #421 · 0.91', x: 28, y: 50, w: 6.5, h: 24 },
      { kind: 'helmet', x: 28.8, y: 51, w: 2, h: 4.6 },
      { kind: 'vehicle', label: 'Rickshaw #419 · 0.87', x: 58, y: 44, w: 12, h: 21 },
    ],
  },
  'CAM-02': {
    time: '14 Nov 2026 · 10:42:17',
    vehiclesInView: 7,
    zones: [{ label: 'Zone B · allowed ↓', x: 55.1, y: 34.1, w: 18.4, h: 65.9 }],
    detections: [
      { kind: 'vehicle', label: 'Car #412 · 0.94', x: 23.9, y: 48.1, w: 15.4, h: 22.9 },
      { kind: 'vehicle', label: 'Bike #402', x: 41.1, y: 58.1, w: 6.3, h: 24.5 },
      { kind: 'violation', x: 41.7, y: 58.8, w: 1.9, h: 4.8 },
      { kind: 'violation', x: 43.5, y: 59.3, w: 1.9, h: 4.8 },
      { kind: 'helmet', x: 45.2, y: 59.7, w: 1.9, h: 4.8 },
      { kind: 'violation', label: 'Wrong-way · Car #418', x: 60, y: 52.2, w: 8.6, h: 30.9 },
    ],
  },
  'CAM-03': {
    time: '14 Nov 2026 · 10:42:15',
    vehiclesInView: 9,
    zones: [],
    detections: [
      { kind: 'vehicle', label: 'Car #455 · 0.92', x: 22, y: 46, w: 14, h: 21 },
      { kind: 'vehicle', label: 'Hiace #451 · 0.89', x: 56, y: 40, w: 13, h: 26 },
      { kind: 'vehicle', label: 'Bike #449', x: 74, y: 60, w: 6, h: 23 },
      { kind: 'violation', x: 74.8, y: 61, w: 1.9, h: 4.8 },
    ],
  },
  'CAM-04': null, // offline: nothing is streamed
}

// Newest first. `alert: true` events are violations (shown in orange).
export const liveEvents = [
  { title: 'Wrong-way driving', detail: 'Car #418 · Zone B · 10:42:15', alert: true },
  { title: 'Triple riding · 2 without helmet', detail: 'Bike #402 · seen in 6 of 8 frames · 10:39:51', alert: true },
  { title: 'Vehicle count updated', detail: '+38 in the last 5 minutes · 10:38:00' },
  { title: 'Device heartbeat', detail: 'CAM-02 online · CPU 61% · 10:37:30' },
]
