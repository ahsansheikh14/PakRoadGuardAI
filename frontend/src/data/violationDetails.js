// Extra evidence for each violation, shown on its review page.
// frames: the last 8 frames of the track; true = the rule held in that frame.
// fact: second line of "What the system saw" (differs per type).
export const violationDetails = {
  'V-1042': {
    seconds: '10:42:15',
    frames: [true, true, true, true, true, true, false, true],
    vehicleName: 'Car',
    fact: ['Zone', 'Zone B (allowed ↓)'],
    alsoFlagged: 'Nothing else',
    models: 'YOLO26n vehicle',
  },
  'V-1041': {
    seconds: '10:39:51',
    frames: [true, true, false, true, true, false, true, true],
    vehicleName: 'Motorbike',
    fact: ['Riders counted', '3 (1 helmet, 2 without)'],
    alsoFlagged: 'No helmet ×2',
    models: 'YOLO26n vehicle + helmet',
  },
  'V-1040': {
    seconds: '10:35:08',
    frames: [true, true, true, false, true, true, true, true],
    vehicleName: 'Motorbike',
    fact: ['Riders counted', '1 (without helmet)'],
    alsoFlagged: 'Nothing else',
    models: 'YOLO26n vehicle + helmet',
  },
  'V-1039': {
    seconds: '10:31:40',
    frames: [true, false, true, false, true, true, false, true],
    vehicleName: 'Motorbike',
    fact: ['Riders counted', '2 (1 helmet, 1 without)'],
    alsoFlagged: 'Nothing else',
    models: 'YOLO26n vehicle + helmet',
  },
  'V-1038': {
    seconds: '10:27:22',
    frames: [true, true, true, true, false, true, true, true],
    vehicleName: 'Motorbike',
    fact: ['Riders counted', '1 (without helmet)'],
    alsoFlagged: 'Nothing else',
    models: 'YOLO26n vehicle + helmet',
  },
  'V-1037': {
    seconds: '10:20:03',
    frames: [false, true, true, true, true, true, false, true],
    vehicleName: 'Car',
    fact: ['Zone', 'Zone B (allowed ↓)'],
    alsoFlagged: 'Nothing else',
    models: 'YOLO26n vehicle',
  },
  'V-1036': {
    seconds: '10:11:47',
    frames: [true, true, true, true, true, true, true, false],
    vehicleName: 'Motorbike',
    fact: ['Riders counted', '3 (all without helmet)'],
    alsoFlagged: 'No helmet ×3',
    models: 'YOLO26n vehicle + helmet',
  },
}

// Decisions already made on the sample data (shown in the audit trail).
export const pastDecisions = {
  'V-1040': { time: '10:36:30', by: 'Reviewing officer', note: '' },
  'V-1039': { time: '10:33:02', by: 'Reviewing officer', reason: 'Helmet visible in other frames' },
  'V-1036': { time: '10:14:10', by: 'Reviewing officer', note: '' },
}

// The evidence picture for each type. Boxes are in percent of the picture.
// heads: rider heads (helmet = green box, no helmet = orange box). plate: blurred plate.
export const evidenceScenes = {
  'triple-riding': {
    box: { x: 33.9, y: 18.2, w: 30.5, h: 74.9 },
    heads: [
      { x: 36.5, y: 21.4, w: 7.4, h: 14.7, helmet: false },
      { x: 45, y: 20, w: 7.5, h: 14.7, helmet: true },
      { x: 53.5, y: 22, w: 7.4, h: 14.7, helmet: false },
    ],
    plate: { x: 43.9, y: 80, w: 10.1, h: 6 },
  },
  'no-helmet': {
    box: { x: 40, y: 18.2, w: 17, h: 74.9 },
    heads: [{ x: 44.6, y: 21.4, w: 7.4, h: 14.7, helmet: false }],
    plate: { x: 43.4, y: 80, w: 10.1, h: 6 },
  },
  'wrong-way': {
    box: { x: 30, y: 30, w: 34, h: 58 },
    heads: [],
    plate: { x: 41.5, y: 74, w: 11, h: 6.5 },
  },
}
