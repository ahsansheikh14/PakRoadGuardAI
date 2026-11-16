// Detections waiting for (or after) an officer's decision. Newest first.
// type: 'wrong-way' | 'triple-riding' | 'no-helmet'
// status: 'pending' | 'approved' | 'rejected'
export const violations = [
  { id: 'V-1042', type: 'wrong-way', camera: 'CAM-02', date: '2026-11-14', time: '10:42', confidence: 0.88, status: 'pending', vehicle: 'Car', track: 418 },
  { id: 'V-1041', type: 'triple-riding', camera: 'CAM-01', date: '2026-11-14', time: '10:39', confidence: 0.81, status: 'pending', vehicle: 'Bike', track: 402 },
  { id: 'V-1040', type: 'no-helmet', camera: 'CAM-01', date: '2026-11-14', time: '10:35', confidence: 0.93, status: 'approved', vehicle: 'Bike', track: 397 },
  { id: 'V-1039', type: 'no-helmet', camera: 'CAM-03', date: '2026-11-14', time: '10:31', confidence: 0.64, status: 'rejected', vehicle: 'Bike', track: 388 },
  { id: 'V-1038', type: 'no-helmet', camera: 'CAM-01', date: '2026-11-14', time: '10:27', confidence: 0.9, status: 'pending', vehicle: 'Bike', track: 381 },
  { id: 'V-1037', type: 'wrong-way', camera: 'CAM-02', date: '2026-11-14', time: '10:20', confidence: 0.77, status: 'pending', vehicle: 'Car', track: 366 },
  { id: 'V-1036', type: 'triple-riding', camera: 'CAM-03', date: '2026-11-14', time: '10:11', confidence: 0.85, status: 'approved', vehicle: 'Bike', track: 352 },
]

// Names shown on screen for each type. `short` is used in tables, `long` in headings.
export const violationTypes = {
  'no-helmet': { short: 'No helmet', long: 'No helmet' },
  'wrong-way': { short: 'Wrong-way', long: 'Wrong-way driving' },
  'triple-riding': { short: 'Triple riding', long: 'Triple riding' },
}
