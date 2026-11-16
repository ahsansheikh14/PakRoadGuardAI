// Charts on the dashboard.

// Violations per hour, starting at 7 am (one number per hour, 7 am to 6 pm).
export const violationsByHour = {
  firstHour: 7,
  counts: [3, 9, 14, 8, 5, 4, 6, 5, 7, 11, 13, 6],
}

// Share of vehicles counted today, in percent.
export const vehicleMix = [
  { label: 'Bike', percent: 46 },
  { label: 'Car', percent: 34 },
  { label: 'Rickshaw', percent: 9 },
  { label: 'Hiace', percent: 5 },
  { label: 'Bus/Truck', percent: 6 },
]
