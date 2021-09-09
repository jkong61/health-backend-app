import React from 'react'
import Login from 'pages/Login'
import {
  Route,
  Redirect
} from 'react-router-dom'
import { useAuthProvider } from 'providers/AuthProvider'

const AuthContainer = () => {
  const [state] = useAuthProvider()

  return (
        <>
          <Route
            exact
            path="/"
            // component={Login}
            render={({ location }) => {
              if (state.isAuthenticated) {
                return (
                  <Redirect
                    to={{ pathname: '/home', state: { from: location } }}
                  />
                )
              } else return <Login/>
            }}
          />
        </>
  )
}
export default AuthContainer
