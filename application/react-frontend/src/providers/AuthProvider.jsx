import React, { useEffect, useReducer, useContext, createContext } from 'react'
import HttpHelper from 'utilities/HttpHelper'
import PropTypes from 'prop-types'

const ProviderName = 'AuthProvider'
const AUTH_KEY = 'token'

export const defaultAuthState = {
  token: localStorage.getItem(AUTH_KEY),
  isAuthenticated: false,
  profile: null
}

export const AuthProviderDispatchMethodConstants = {
  SAVE_AUTH: 'saveAuth',
  RESET: 'resetState',
  UPDATE_ISAUTH: 'updateIsAuth',
  SAVE_PROFILE: 'updateProfile'
}

const AuthContext = createContext(defaultAuthState)

export function useAuthProvider () {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducerAuth, defaultAuthState)

  const getUserDetails = async (token) => {
    if (token) {
      console.log(`${ProviderName}: Retrieving userdata from API.`)

      // call api to checking whether token is still valid or not
      const data = await HttpHelper.Get.GetUserMe(token)
      if (data.error) {
        // @ts-ignore
        // reset state if invalid
        return dispatch({ type: AuthProviderDispatchMethodConstants.RESET })
      }
      // @ts-ignore
      dispatch({ type: AuthProviderDispatchMethodConstants.UPDATE_ISAUTH, payload: true })
      // @ts-ignore
      dispatch({ type: AuthProviderDispatchMethodConstants.SAVE_PROFILE, payload: data.data })
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      // when there is an authentication token
      if (state.token) {
        await getUserDetails(state.token)
      } else {
        // when the user logs out and the authentication token is removed
        console.log(`${ProviderName}: Removing user data from storage.`)
        // @ts-ignore
        dispatch({ type: AuthProviderDispatchMethodConstants.RESET })
      }
    }
    console.log(`${ProviderName}: Initiate Provider.`)
    fetchData()
  }, [state.token])

  return (
    <AuthContext.Provider value={[state, dispatch]}>
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
}

function reducerAuth (state, action) {
  if (action.payload !== {}) {
    switch (action.type) {
    // Reducer used to get the initial data loading of the screen
      case AuthProviderDispatchMethodConstants.SAVE_AUTH:
        return {
          ...state,
          ...action.payload
        }
      case AuthProviderDispatchMethodConstants.UPDATE_ISAUTH:
        return {
          ...state,
          isAuthenticated: action.payload
        }
      case AuthProviderDispatchMethodConstants.SAVE_PROFILE:
        return {
          ...state,
          profile: action.payload
        }
      case AuthProviderDispatchMethodConstants.RESET:
        console.log('reseting')
        localStorage.clear() // clear all localstorage instead
        return defaultAuthState
      default:
        return state
    }
  }
}
