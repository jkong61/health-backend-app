import React, { useEffect, useReducer, useContext, createContext } from 'react'
import HttpHelper from 'utilities/HttpHelper'
import PropTypes from 'prop-types'
import { useAuthProvider } from 'providers/AuthProvider'

const PROVIDERNAME = 'ReportProvider'
export const ReportProviderDispatchMethodConstants = {
  GENERATEREPORT: 'generatereport',
  COMPLETEREPORT: 'completereport',
  RAISEERROR: 'error'
}

const defaultReportState = {
  trend: {
    loading: false, // set to true when waiting for item from server
    parameters: undefined,
    result: {}
  }
}

const ReportContext = createContext(defaultReportState)

export function useReportProvider () {
  return useContext(ReportContext)
}

export function ReportProvider ({ children }) {
  const [state, dispatch] = useReducer(reducerClinician, defaultReportState)
  const [authState] = useAuthProvider()

  // TODO: Generate save the report into the clinician provider
  async function generateReport () {
    console.log(`${PROVIDERNAME}: Generating Report.`)
    let response
    try {
      // const response = await asyncDelay(10);
      response = await HttpHelper.Post.ClinicianGenerateReport(
        state.trend.parameters,
        authState.token
      )
      if (response.error) {
        throw Error(response.message)
      } else {
        console.log(`${PROVIDERNAME}: Report Completed.`)
        // console.log(response)
        const data = Object.entries(response.data).map(([key, value]) => ({
          title: key,
          data: value
        }))
        // @ts-ignore
        dispatch({
          type: ReportProviderDispatchMethodConstants.COMPLETEREPORT,
          payload: data || {}
        })
      }
    } catch (err) {
      console.error(err)
      // @ts-ignore
      dispatch({ type: ReportProviderDispatchMethodConstants.RAISEERROR })
    }
  }

  // Used for generating report by changing loading to true
  useEffect(() => {
    if (state.trend.loading) {
      generateReport()
    }
  }, [state.trend.loading])

  return (
    <ReportContext.Provider value={[state, dispatch]}>
      {children}
    </ReportContext.Provider>
  )
}

ReportProvider.propTypes = {
  children: PropTypes.node.isRequired
}

function reducerClinician (state, action) {
  if (action.payload !== {}) {
    switch (action.type) {
      case ReportProviderDispatchMethodConstants.GENERATEREPORT:
        return {
          allAssignments: state.allAssignments,
          trend: {
            loading: true,
            parameters: action.payload,
            result: state.trend.result
          }
        }
      case ReportProviderDispatchMethodConstants.COMPLETEREPORT:
        return {
          allAssignments: state.allAssignments,
          trend: {
            loading: false,
            parameters: undefined,
            result: action.payload
          }
        }
      case ReportProviderDispatchMethodConstants.RAISEERROR:
        return {
          allAssignments: state.allAssignments,
          trend: {
            loading: undefined,
            parameters: undefined,
            result: state.trend.result
          }
        }
      case ReportProviderDispatchMethodConstants.RESETSTATE:
        return defaultReportState
      default:
        return state
    }
  }
}
