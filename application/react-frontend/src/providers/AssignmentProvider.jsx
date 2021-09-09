import React, { useEffect, useReducer, useContext, createContext } from 'react'
import HttpHelper from 'utilities/HttpHelper'
import PropTypes from 'prop-types'
import { useAuthProvider } from 'providers/AuthProvider'

const PROVIDERNAME = 'AssignmentProvider'
export const AssignmentProviderDispatchMethodConstants = {
  SAVE_ASSGINMENT: 'saveAssignments',
  UPDATE_ASSGINMENT: 'updateAssignment',
  RESETSTATE: 'resetState'
}

const defaultAssignmentState = []

const AssignmentContext = createContext(defaultAssignmentState)

export function useAssignmentProvider () {
  return useContext(AssignmentContext)
}

export function AssignmentProvider ({ children }) {
  const [state, dispatch] = useReducer(
    reducerClinician,
    defaultAssignmentState
  )
  const [authState] = useAuthProvider()

  async function fetchAllAssignments (token) {
    console.log(`${PROVIDERNAME}: Retrieving Clinician Assignments.`)
    if (token) {
      try {
        console.log(`${PROVIDERNAME}: Retrieving Assignments from API.`)
        const res = await HttpHelper.Get.GetAllClinicianAssignments(token)
        if (res.error) {
          throw Error(res.message)
        } else {
          // @ts-ignore
          dispatch({
            type: AssignmentProviderDispatchMethodConstants.SAVE_ASSGINMENT,
            payload: res.data
          })
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  async function fetchData () {
    if (authState.token) {
      fetchAllAssignments(authState.token)
    }
  }

  useEffect(() => {
    if (authState.token) {
      console.log(`${PROVIDERNAME}: Initiate Provider.`)
      fetchData()
    } else {
      console.log(`${PROVIDERNAME}: Removing clinician data from storage.`)
      // @ts-ignore
      dispatch({ type: AssignmentProviderDispatchMethodConstants.RESETSTATE })
    }
  }, [authState.token])

  return (
    <AssignmentContext.Provider value={[state, dispatch]}>
      {children}
    </AssignmentContext.Provider>
  )
}

AssignmentProvider.propTypes = {
  children: PropTypes.node.isRequired
}

function reducerClinician (state, action) {
  if (action.payload !== {}) {
    let localrecords
    let array
    switch (action.type) {
      case AssignmentProviderDispatchMethodConstants.SAVE_ASSGINMENT:
        return action.payload
      case AssignmentProviderDispatchMethodConstants.UPDATE_ASSGINMENT:
        localrecords = state
        array = localrecords.map((x) => {
          if (x.clinician_assignment_id === action.payload.clinician_assignment_id) {
            return action.payload
          }
          return x
        })
        return array
      case AssignmentProviderDispatchMethodConstants.RESETSTATE:
        return defaultAssignmentState
      default:
        return state
    }
  }
}
