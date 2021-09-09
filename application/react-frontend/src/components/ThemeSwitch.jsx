import React from 'react'
import { Switch } from '@headlessui/react'
import {
  SunIcon,
  MoonIcon
} from '@heroicons/react/solid'
import { useThemeProvider, ThemeProviderDispatchMethodConstants } from 'providers/ThemeProvider'

const ThemeSwitch = () => {
  // @ts-ignore
  const [themeState, dispatch] = useThemeProvider()

  const changeTheme = () => {
    // @ts-ignore
    dispatch({ type: ThemeProviderDispatchMethodConstants.UPDATE_THEME, payload: !themeState })
  }

  return (
    <>
      <div className="flex flex-row p-2">
        <div className="mr-0">
          <Switch
            checked={themeState}
            onChange={changeTheme}
            className={`${themeState ? 'bg-gray-800' : 'bg-gray-400'
              } relative inline-flex items-center h-7 rounded-full w-16 transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
          >

            {themeState ? <p className="text-white text-xs mx-2">Dark</p> : <span className="text-white text-xs transform translate-x-8">Light</span>}
            <span
              className={`${themeState ? '-translate-x-1 bg-white' : '-translate-x-6 bg-white'
                } flex w-6 h-6 transform rounded-full transition ease-in-out duration-200 justify-center items-center`}
            >
            {themeState ? <MoonIcon className="h-6 w-6  text-gray-800"/> : <SunIcon className="h-6 w-6 text-yellow-400"/>}

            </span>
          </Switch>
        </div>
      </div>
    </>
  )
}

export default ThemeSwitch
