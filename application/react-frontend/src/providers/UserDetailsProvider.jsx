import React, { useEffect, useReducer, useContext, createContext } from 'react'
import HttpHelper from 'utilities/HttpHelper'
import PropTypes from 'prop-types'
import { useAuthProvider } from 'providers/AuthProvider'

const defaultUserState = {
  email: undefined,
  user_id: undefined,
  account_type: undefined,
  name: '',
  contact_information: '',
  date_created: undefined
}

const ProviderName = 'UserProvider'

const USER_DETAILS_KEY = 'userDetail'

const UserContext = createContext(defaultUserState)

export const UserDetailsProviderDispatchMethodConstants = {
  SAVECURRENTUSER: 'saveUserMe',
  RESETSTATE: 'resetState'
}

export function useUserProvider () {
  return useContext(UserContext)
}

export function UserProvider ({ children }) {
  const [state, dispatch] = useReducer(reducerUser, defaultUserState)
  const [authState] = useAuthProvider()

  const getUserDetails = async (token) => {
    if (token) {
      try {
        console.log(`${ProviderName}: Retrieving userdata from API.`)
        const data = await HttpHelper.Get.GetUserMe(token)
        // @ts-ignore
        dispatch({ type: UserDetailsProviderDispatchMethodConstants.SAVECURRENTUSER, payload: data })
      } catch (err) {
        console.error(err)
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      // when there is an authentication token
      if (authState?.token) {
        await getUserDetails(authState.token)
      } else {
        // when the user logs out and the authentication token is removed
        console.log(`${ProviderName}: Removing user data from storage.`)
        // @ts-ignore
        dispatch({ type: UserDetailsProviderDispatchMethodConstants.RESETSTATE })
      }
    }
    console.log(`${ProviderName}: Initiate Provider.`)
    fetchData()
  }, [authState.token])

  return (
    <UserContext.Provider value={[state, dispatch]}>
      {children}
    </UserContext.Provider>
  )
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired
}

function reducerUser (state, action) {
  if (action.payload !== {}) {
    switch (action.type) {
      case UserDetailsProviderDispatchMethodConstants.SAVECURRENTUSER:
        return {
          ...action.payload
        }
      case UserDetailsProviderDispatchMethodConstants.RESETSTATE:
        return defaultUserState
      default:
        return state
    }
  }
}
