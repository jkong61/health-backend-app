import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useAuthProvider } from 'providers/AuthProvider'

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const [state] = useAuthProvider()
  return (
    <Route
      {...rest}
      render={({ location }) => {
        if (state.isAuthenticated) return <Component/>
        else {
          return (
            <Redirect to={{ pathname: '/', state: { from: location } }} />
          )
        }
      }}
    />
  )
}
ProtectedRoute.propTypes = {
  component: PropTypes.elementType.isRequired
}
export default ProtectedRoute
