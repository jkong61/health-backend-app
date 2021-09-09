import React from 'react'
import ProtectedRoute from 'router/ProtectedRoute'
import NavSideBar from 'components/NavSideBar'
import Header from 'components/Header'
import Content from 'containers/Content/Content'
import TestDashBoard from 'containers/TestDashBoard'
import ChartsDashboard from 'containers/ChartsDashBoard'
import PatientsBoard from 'containers/PatientsBoard'
import TrendAnalyzerBoard from 'containers/TrendAnalyzerBoard'
import HomeBoard from 'containers/HomeBoard'
import PatientDetailBoard from 'containers/PatientDetailBoard'

const CoreContainer = () => {
  return (
    <>
      <main className="bg-gray-100 dark:bg-gray-800 h-screen overflow-hidden relative">
        <div className="flex items-start justify-between">
          <NavSideBar />
          <div className="flex flex-col w-full pl-0 md:p-4 md:space-y-4">
            <Header />
            <Content>
              <ProtectedRoute exact path="/home" component={HomeBoard} />
              <ProtectedRoute
                exact
                path="/dashboard"
                component={TestDashBoard}
              />
              {/* <ProtectedRoute
                exact
                path="/charts"
                component={ChartsDashboard}
              /> */}
              <ProtectedRoute
                exact
                path="/trend_analyzer"
                component={TrendAnalyzerBoard}
              />
              <ProtectedRoute
                exact
                path="/patients"
                component={PatientsBoard}
              />
              <ProtectedRoute
                exact
                path="/patients/:id"
                component={PatientDetailBoard}
              />
              <ProtectedRoute
                exact
                path="/patients/:id/chart"
                component={ChartsDashboard}
              />
            </Content>
          </div>
        </div>
      </main>
    </>
  )
}
export default CoreContainer
