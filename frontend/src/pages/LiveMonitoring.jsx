import { useState } from 'react'
import { getCameras, getLiveFeed } from '../api'
import PageHeader from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import CameraTabs from './live/CameraTabs'
import Legend from './live/Legend'
import LiveEvents from './live/LiveEvents'
import LiveFrame from './live/LiveFrame'
import LiveStats from './live/LiveStats'

export default function LiveMonitoring() {
  const [cameraId, setCameraId] = useState('CAM-02')
  const { data: cameras } = useApi(getCameras)
  const { data: live } = useApi(() => getLiveFeed(cameraId), [cameraId])

  const tabs = cameras && (
    <CameraTabs cameras={cameras} selected={cameraId} onSelect={setCameraId} />
  )

  return (
    <>
      <PageHeader title="Live monitoring" actions={tabs} actionsClassName="mt-2">
        Detections drawn by the edge device in real time. Faces and plates are blurred on the device.
      </PageHeader>

      {live && (
        <div className="mt-[17px] grid grid-cols-[1fr_337px] gap-5">
          <div>
            <LiveFrame camera={live.camera} feed={live.feed} />
            <Legend />
            <LiveStats camera={live.camera} feed={live.feed} />
          </div>
          <LiveEvents events={live.events} />
        </div>
      )}
    </>
  )
}
