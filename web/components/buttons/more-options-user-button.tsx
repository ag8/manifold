import { usePrivateUser } from 'web/hooks/use-user'
import { updateUser } from 'web/lib/firebase/users'
import { Button } from 'web/components/buttons/button'
import { Modal } from 'web/components/layout/modal'
import React, { useState } from 'react'
import { Col } from 'web/components/layout/col'
import { User } from 'common/user'
import clsx from 'clsx'
import { DotsHorizontalIcon } from '@heroicons/react/outline'
import { useAdmin } from 'web/hooks/use-admin'
import { UncontrolledTabs } from 'web/components/layout/tabs'
import { BlockUser } from 'web/components/profile/block-user'
import { ReportUser } from 'web/components/profile/report-user'
import { Title } from 'web/components/widgets/title'
import { Row } from '../layout/row'
import { PROJECT_ID } from 'common/envs/constants'

export function MoreOptionsUserButton(props: { user: User }) {
  const { user } = props
  const { id: userId, name } = user
  const currentUser = usePrivateUser()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isAdmin = useAdmin()
  if (!currentUser || currentUser.id === userId) return null

  return (
    <>
      <Button color={'gray-white'} onClick={() => setIsModalOpen(true)}>
        <DotsHorizontalIcon
          className={clsx('h-5 w-5 flex-shrink-0')}
          aria-hidden="true"
        />
      </Button>
      <Modal open={isModalOpen} setOpen={setIsModalOpen}>
        <Col className={'bg-canvas-0 text-ink-1000 rounded-md p-4 '}>
          <Title className={'!mb-2 flex justify-between'}>
            {name}
            {isAdmin && (
              <Button
                color={'red'}
                onClick={() => {
                  updateUser(userId, {
                    isBannedFromPosting: !(user.isBannedFromPosting ?? false),
                  })
                }}
              >
                {user.isBannedFromPosting ? 'Banned' : 'Ban User'}
              </Button>
            )}
          </Title>
          {isAdmin && (
            <Row className={'px-1'}>
              <span>
                <a
                  className="text-primary-400 mr-2 text-sm hover:underline"
                  href={firestoreUserConsolePath(user.id)}
                >
                  firestore user
                </a>
                <a
                  className="text-primary-400 text-sm hover:underline"
                  href={firestorePrivateConsolePath(user.id)}
                >
                  private user
                </a>
              </span>
            </Row>
          )}
          <UncontrolledTabs
            className={'mb-4'}
            tabs={[
              {
                title: 'Block',
                content: (
                  <BlockUser
                    user={user}
                    currentUser={currentUser}
                    closeModal={() => setIsModalOpen(false)}
                  />
                ),
              },
              {
                title: 'Report',
                content: (
                  <ReportUser
                    user={user}
                    currentUser={currentUser}
                    closeModal={() => setIsModalOpen(false)}
                  />
                ),
              },
            ]}
          />
        </Col>
      </Modal>
    </>
  )
}

function firestoreUserConsolePath(userId: string) {
  return `https://console.firebase.google.com/project/${PROJECT_ID}/firestore/data/~2Fusers~2F${userId}`
}

function firestorePrivateConsolePath(userId: string) {
  return `https://console.firebase.google.com/project/${PROJECT_ID}/firestore/data/~2Fprivate-users~2F${userId}`
}
