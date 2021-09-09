import NavSideBarLink from 'components/NavSideBarLink'
import {
  ChartBarIcon,
  HomeIcon,
  UsersIcon
} from '@heroicons/react/solid'
import React from 'react'
import { ReactComponent as AppLogo } from 'svgs/applogo.svg'

export default function NavSideBar () {
  return (
    <div className="h-screen hidden lg:block my-4 ml-4 shadow-lg relative w-80">
      <div className="bg-white h-full rounded-2xl dark:bg-gray-700">
        <div className="flex items-center justify-center pt-6">
          <AppLogo className="h-10 w-10" />
          <p className="font-bold text-xl text-gray-500 dark:text-white px-3">
            HealthOnline
          </p>
        </div>
        <nav className="mt-6">
          <div>
            <NavSideBarLink
              iconSVG={
                <HomeIcon className="h-5 w-5"/>
              }
              linkDescription={'Home'}
              url={'/home'}
              />
            {/* <NavSideBarLink
              iconSVG={
                <ChartBarIcon className="h-5 w-5"/>
              }
              linkDescription={'Charts'}
              url={'/charts'}
            /> */}
            <NavSideBarLink
              iconSVG={
                <ChartBarIcon className="h-5 w-5"/>
              }
              linkDescription={'Trend Analyzer'}
              url={'/trend_analyzer'}
            />
            <NavSideBarLink
              iconSVG={
                <UsersIcon className="h-5 w-5"/>
              }
              linkDescription={'Patients'}
              url={'/patients'}
            />
          </div>
        </nav>
      </div>
    </div>
  )
}
