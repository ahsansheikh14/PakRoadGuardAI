import { useEffect, useState } from 'react'
import { getCameras, getCameraSetup, saveCameraSetup } from '../api'
import Button from '../components/Button'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import CameraCards from './cameras/CameraCards'
import RuleSettings from './cameras/RuleSettings'
import ZoneEditor from './cameras/ZoneEditor'

// Administrator only (see App.jsx).
export default function Cameras() {
  const { data: cameras } = useApi(getCameras)
  const [cameraId, setCameraId] = useState('CAM-02')
  const [setup, setSetup] = useState(null) // zones, counting lines and settings being edited
  const [selectedZone, setSelectedZone] = useState(0)
  const [message, setMessage] = useState('')

  // Load the chosen camera's setup. Unsaved edits to the previous camera are dropped.
  useEffect(() => {
    getCameraSetup(cameraId).then((data) => {
      setSetup(data)
      setSelectedZone(0)
      setMessage('')
    })
  }, [cameraId])

  function update(changes) {
    setSetup({ ...setup, ...changes })
    setMessage('')
  }

  function changeZone(index, zone) {
    update({ zones: setup.zones.map((z, i) => (i === index ? zone : z)) })
  }

  function addZone() {
    update({ zones: [...setup.zones, { x: 35, y: 45, w: 25, h: 40, direction: 'up' }] })
    setSelectedZone(setup.zones.length)
  }

  function addCountingLine() {
    update({ countingLines: [...setup.countingLines, 60 + setup.countingLines.length * 8] })
  }

  async function save() {
    const { savedAt } = await saveCameraSetup(cameraId, setup)
    setMessage(`Saved at ${savedAt}. Waiting for ${cameraId} to pick it up.`)
  }

  const addCamera = (
    <Button
      variant="primary"
      onClick={() => setMessage('Adding a camera needs the backend, which comes later.')}
      className="h-11 w-[113px] font-semibold"
    >
      Add camera
    </Button>
  )

  return (
    <>
      <PageHeader title="Cameras & zones" actions={addCamera}>
        Health of each edge device, and the direction zones used by the wrong-way rule.
        Administrator only.
      </PageHeader>

      {cameras && <CameraCards cameras={cameras} selected={cameraId} onSelect={setCameraId} />}

      {setup && (
        <Card className="mt-[21px] flex gap-5 p-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] leading-6 font-semibold">Direction zones · {cameraId}</h2>
              <span className="text-[13px] text-slate-500">
                Drag corners to edit · arrow = allowed direction
              </span>
            </div>
            <ZoneEditor
              zones={setup.zones}
              countingLines={setup.countingLines}
              selected={selectedZone}
              onSelect={setSelectedZone}
              onChangeZone={changeZone}
            />
            <div className="mt-[11px] flex items-center gap-2">
              <Button onClick={addZone} className="h-[43px] px-[14px] font-normal">
                + Add zone
              </Button>
              <Button onClick={addCountingLine} className="h-[43px] px-[14px] font-normal">
                + Add counting line
              </Button>
              <Button
                onClick={() => setMessage('A new still image will come from the device once the backend is connected.')}
                className="h-[43px] px-[14px] font-normal"
              >
                Refresh still image
              </Button>
            </div>
            {message && <p className="mt-3 text-[13px] text-slate-600">{message}</p>}
          </div>

          <RuleSettings
            settings={setup.settings}
            onChange={(settings) => update({ settings })}
            onSave={save}
          />
        </Card>
      )}
    </>
  )
}
