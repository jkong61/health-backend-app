import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom'
import CoreContainer from 'containers/CoreContainer'
import AuthContainer from 'containers/AuthContainer'
import { AuthProvider } from 'providers/AuthProvider'
import { ThemeProvider } from 'providers/ThemeProvider'
import { AssignmentProvider } from 'providers/AssignmentProvider'
import { ReportProvider } from 'providers/ReportProvider'

export default function MainRoute () {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AssignmentProvider>
          <ReportProvider>
            <Router>
              <Switch>
                <Route exact path='/' component={AuthContainer} />
                <Route
                  exact
                  path={[
                    '/home',
                    '/charts',
                    '/trend_analyzer',
                    '/patients',
                    '/patients/:id',
                    '/patients/:id/chart'
                  ]}
                  component={CoreContainer}
                />
                <Route
                  path='*'
                  render={({ location }) => (
                    <Redirect
                      to={{ pathname: '/', state: { from: location } }}
                    />
                  )}
                />
              </Switch>
            </Router>
          </ReportProvider>
        </AssignmentProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
