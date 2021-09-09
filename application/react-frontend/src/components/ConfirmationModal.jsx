/* eslint-disable no-tabs */
import { Dialog, Transition } from '@headlessui/react'
import React, { Fragment, useRef } from 'react'
import PropTypes from 'prop-types'
import { ReactComponent as Spinner } from 'svgs/spinner.svg'
import useLoading from 'utilities/customHooks/useLoading'

function ConfirmationModal ({ show, onClick, toggleModal, title, message, btnStyle }) {
  const cancelButtonRef = useRef()
  const [handleSubmit, loadingFunction] = useLoading(onClick)

  return (
		<Transition show={show} as={Fragment}>
			<Dialog
				as='div'
				id='modal'
				className='fixed inset-0 z-20 overflow-y-auto'
				initialFocus={cancelButtonRef}
				static
				open={show}
				onClose={toggleModal}>
				<div className='min-h-screen px-4 text-center'>
					<Transition.Child
						as={Fragment}
						enter='ease-out duration-300'
						enterFrom='opacity-0'
						enterTo='opacity-100'
						leave='ease-in duration-200'
						leaveFrom='opacity-100'
						leaveTo='opacity-0'>
						<Dialog.Overlay className='fixed inset-0 opacity-30 bg-black' />
					</Transition.Child>

					{/* This element is to trick the browser into centering the modal contents. */}
					<span
						className='inline-block h-screen align-middle'
						aria-hidden='true'>
						&#8203;
					</span>
					<Transition.Child
						as={Fragment}
						enter='ease-out duration-300'
						enterFrom='opacity-0 scale-95'
						enterTo='opacity-100 scale-100'
						leave='ease-in duration-200'
						leaveFrom='opacity-100 scale-100'
						leaveTo='opacity-0 scale-95'>
						<div className='inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl'>
							<Dialog.Title
								as='h3'
								className='text-lg font-medium leading-6 text-gray-900'>
								{title}
							</Dialog.Title>
							<div className='mt-2'>
								<p className='text-sm text-gray-500'>{message}</p>
							</div>

							<div className='mt-4 flex justify-end'>
								<button
									type='button'
									className={btnStyle ?? 'mx-2 px-4 py-2 text-sm font-medium text-gray-100 bg-red-500 border border-transparent rounded-md hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500'}
									onClick={handleSubmit}>
                                    {loadingFunction
                                      ? <Spinner className="h-5 animate-spin mr-3 self-center"/>
                                      : <span className="self-center">Yes. Confirm</span>}

								</button>
								<button
									type='button'
									className='inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500'
									onClick={toggleModal}>
									Cancel
								</button>
							</div>
						</div>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition>
  )
}

ConfirmationModal.propTypes = {
  show: PropTypes.bool,
  toggleModal: PropTypes.func,
  onClick: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
  btnStyle: PropTypes.string
}

export default ConfirmationModal
