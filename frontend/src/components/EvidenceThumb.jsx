// Small grey picture with an orange box: stands in for the evidence snapshot
// until the backend sends real (blurred) images.
export default function EvidenceThumb({ src, alt = 'Evidence snapshot' }) {
  if (src) {
    return <img src={src} alt={alt} className="h-[54px] w-24 rounded-md object-cover" />
  }
  return (
    <div className="flex h-[54px] w-24 items-center justify-center rounded-md bg-[#394553]">
      <div className="size-[38px] border-2 border-orange-500" />
    </div>
  )
}
