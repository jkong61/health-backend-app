/* eslint-disable no-tabs */
import React, { Fragment, useState } from 'react'
import PropTypes from 'prop-types'
import { Menu, Transition } from '@headlessui/react'
import ConfirmationModal from 'components/ConfirmationModal'
import { LogoutIcon } from '@heroicons/react/outline'
import {
  useAuthProvider,
  AuthProviderDispatchMethodConstants
} from 'providers/AuthProvider'

const ProfileAvatar = ({ imageSrc }) => {
  const [, dispatch] = useAuthProvider()

  const [show, setShow] = useState(false)

  const toggleModal = () => {
    setShow(!show)
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: AuthProviderDispatchMethodConstants.RESET })
  }

  return (
    <div className="relative p-1 md:ml-5 mr-0 md:mr-4">
      <Menu as="div" className="relative inline-block">
        {({ open }) => (
          <>
            <Menu.Button className="inline-flex h-10 w-10  justify-center align-middle rounded-full focus:outline-none">
              <img
                alt="profil"
                src={imageSrc}
                className="object-cover rounded-full h-10 w-10"
              />
            </Menu.Button>
            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items
                static
                className="absolute right-0 w-32 top-14 origin-top-right bg-white dark:bg-gray-600 rounded-md shadow-xl focus:outline-none"
              >
                <div className="px-1 py-1 ">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={toggleModal}
                        className={`${active ? 'text-red-500 dark:bg-gray-700 bg-gray-100' : 'text-red-400'
                          } group flex rounded-md items-center w-full px-2 py-2 text-sm font-medium focus:outline-none transition-colors duration-100 dark:bg-gray-600`}
                      >
                        <LogoutIcon
                          className="w-5 h-5 mr-2"
                          aria-hidden="true"
                        />
                        Sign Out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
      <ConfirmationModal
        show={show}
        toggleModal={toggleModal}
        onClick={logout}
        title={'Confirmation'}
        message={'Are you sure you want to Logout?'}
        btnStyle={
          'mx-2 px-4 py-2 text-sm font-medium text-gray-100 bg-red-500 border border-transparent rounded-md hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500'
        }
      />
    </div>
  )
}

ProfileAvatar.propTypes = {
  imageSrc: PropTypes.string
}

export default ProfileAvatar
