import { LockClosedIcon } from '@heroicons/react/solid'
import { useIsGroupMember } from 'web/hooks/use-group'
import { Col } from '../layout/col'
import * as unlocking from '../../public/lottie/unlocking-icon.json'
import Lottie from 'react-lottie'
import { GroupPageContent } from 'web/pages/group/[...slugs]'

export function LoadingPrivateGroup() {
  return (
    <Col className="mt-24 h-full w-full items-center justify-center lg:mt-0">
      <Lottie
        options={{
          loop: true,
          autoplay: true,
          animationData: unlocking,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
          },
        }}
        height={200}
        width={200}
        isStopped={false}
        isPaused={false}
        style={{
          color: '#6366f1',
          pointerEvents: 'none',
          background: 'transparent',
        }}
      />
      <div>Checking access...</div>
    </Col>
  )
}

export function InaccessiblePrivateGroup() {
  return (
    <Col className="mt-24 h-full w-full items-center justify-center lg:mt-0">
      <LockClosedIcon className="text-ink-400 h-36 w-36" />
      <div>You do not have access to this group!</div>
    </Col>
  )
}

export function PrivateGroupPage(props: { slugs: string[] }) {
  const { slugs } = props
  const isMember = useIsGroupMember(slugs[0], 1000)
  if (isMember === undefined) {
    return <LoadingPrivateGroup />
  } else if (isMember === false) return <InaccessiblePrivateGroup />
  else return <GroupPageContent />
}