// Saves a list of objects as a .csv file in the browser (used by "Export report").
export function downloadCsv(filename, rows) {
  const columns = Object.keys(rows[0] ?? {})
  const lines = [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => `"${row[column]}"`).join(',')),
  ]
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
