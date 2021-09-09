import React, { useEffect, useReducer, useContext, createContext } from 'react'
import PropTypes from 'prop-types'
import { useAuthProvider } from 'providers/AuthProvider'

const ProviderName = 'ThemeProvider'
const THEME_KEY = 'darkTheme'

const THEME = { DARK: true, LIGHT: false }
const defaultThemeState = false

export const ThemeProviderDispatchMethodConstants = {
  UPDATE_THEME: 'saveTheme',
  RESET: 'resetState'
}

const ThemeContext = createContext(defaultThemeState)
export function useThemeProvider () {
  return useContext(ThemeContext)
}

export const ThemeProvider = ({ children }) => {
  // @ts-ignore
  const [authState] = useAuthProvider()
  const [state, dispatch] = useReducer(reducerTheme, defaultThemeState)

  useEffect(() => {
    const fetchData = async () => {
      // when there is an authentication token
      if (authState.token) {
        const theme = localStorage.darkTheme === 'true'
        // @ts-ignore
        dispatch({ type: ThemeProviderDispatchMethodConstants.UPDATE_THEME, payload: theme })
      } else {
        // when the user logs out and the authentication token is removed
        console.log(`${ProviderName}: Removing theme data from storage.`)
        // @ts-ignore
        dispatch({ type: ThemeProviderDispatchMethodConstants.RESET })
      }
    }
    console.log(`${ProviderName}: Initiate Provider.`)
    fetchData()
  }, [authState.token])

  return (
    <ThemeContext.Provider value={[state, dispatch]}>
      {children}
    </ThemeContext.Provider>
  )
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
}

function reducerTheme (state, action) {
  if (action.payload !== {}) {
    switch (action.type) {
      // Reducer used to get the initial data loading of the screen
      case ThemeProviderDispatchMethodConstants.UPDATE_THEME:
        switch (action.payload) {
          case THEME.DARK:
            document.documentElement.classList.add('dark')
            break
          case THEME.LIGHT:
            document.documentElement.classList.remove('dark')
            break
        }
        localStorage.setItem(THEME_KEY, action.payload)
        return action.payload
      case ThemeProviderDispatchMethodConstants.RESET:
        localStorage.removeItem(THEME_KEY)
        return defaultThemeState
      default:
        return state
    }
  }
}
