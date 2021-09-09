/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
/* eslint-disable react/display-name */
import React from 'react'
import GridContentCardContainer from 'containers/Content/GridContentCardContainer'
import WelcomeBoard from 'components/WelcomeBoard'
import { useAuthProvider } from 'providers/AuthProvider'

const HomeBoard = () => {
  const [authState] = useAuthProvider()
  return (
		<div className='grid md:grid-cols-3 md:auto-rows-auto gap-4 grid-cols-3'>
			<div className='col-span-2'>
				<GridContentCardContainer bgcolor={'bg-indigo-300'}>
					<WelcomeBoard name={authState.profile?.name} />
				</GridContentCardContainer>
			</div>
		</div>
  )
}

export default HomeBoard
