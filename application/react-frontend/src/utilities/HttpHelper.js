import Axios from 'axios'
import * as ConfigGenerator from './ConfigGenerator'

export const REQUESTTYPES = {
  POST: 'post',
  GET: 'get'
}

/**
 * Private function used to make Axios Request
 * @param {Object} httpConfig Provide a HTTP Configuration Object.
 */
async function makeAxiosRequest (httpConfig) {
  const data = await Axios(httpConfig)
    .then((response) => {
      const res = response.status === 200 ? response.data : null
      return res // 200 if okay
    })
    .catch((e) => {
      if (e.message === 'Network Error') {
        console.log('Unable to reach Server')
      } else {
        console.log('Error Response: ', e.response)
      }
      return null
    })
  return data
}

/**
 * Private function used to make Axios Request (different version that includes outputting errors and messages from server)
 * @param {Object} httpConfig Provide a HTTP Configuration Object.
 */
async function makeV2AxiosRequest (httpConfig) {
  const returndata = {
    error: false,
    data: undefined,
    message: ''
  }
  const data = await Axios(httpConfig)
    .then((response) => {
      const res = response.status === 200 ? response.data : null
      return { ...returndata, data: res, message: 'OK' } // 200 if okay
    })
    .catch((e) => {
      console.log('Error Response: ', e.response)
      let message
      if (e.message === 'Network Error' || e.code === 'ECONNABORTED') {
        message = 'Unable to reach Server. Please try again later.'
      }
      return { ...returndata, error: true, message: message ?? e.response.data.detail }
    })
  return data
}

const HttpRequest = {
  Post: {
    Login: async (email, password) => {
      // generate a http request config for http request
      const HttpRequestConfig = ConfigGenerator.LoginHttpRequestConfig(
        email,
        password
      )
      return await makeV2AxiosRequest(HttpRequestConfig)
    },
    ClinicianGenerateReport: async (params, token) => {
      const HttpRequestConfig = ConfigGenerator.ClinicianPostTrendAnalyserGenerateReport(
        params,
        token
      )
      return await makeV2AxiosRequest(HttpRequestConfig)
    }
  },
  Get: {
    GetUserMe: async (token) => {
      const HttpRequestConfig = ConfigGenerator.GetUserDetailsMeHttpRequestConfig(
        token
      )

      return await makeV2AxiosRequest(HttpRequestConfig)
    },
    GetAllClinicianAssignments: async (token) => {
      const HttpRequestConfig = ConfigGenerator.GetClinicianAssignmentsHttpRequestConfig(
        token
      )

      return await makeV2AxiosRequest(HttpRequestConfig)
    },
    GetUserById: async (userId, token) => {
      // This API always returns status 200 with null data if not found
      const HttpRequestConfig = ConfigGenerator.GetUserByIdHttpRequestConfig(
        token,
        userId
      )
      return await makeAxiosRequest(HttpRequestConfig)
    },
    GetClinicianAcceptAssignment: async (assignId, token) => {
      const HttpRequestConfig = ConfigGenerator.GetClinicianAcceptAssignmentHttpRequestConfig(
        assignId,
        token
      )

      return await makeV2AxiosRequest(HttpRequestConfig)
    },
    GetClinicianDeleteAssignment: async (assignId, token) => {
      const HttpRequestConfig = ConfigGenerator.GetClinicianDeleteAssignmentHttpRequestConfig(
        assignId,
        token
      )

      return await makeV2AxiosRequest(HttpRequestConfig)
    },
    GetClinicianAssignedUserHealthProfile: async (userid, token) => {
      const HttpRequestConfig = ConfigGenerator.GetClinicianAssignedUserHealthProfileHttpRequestConfig(
        userid,
        token
      )

      return await makeAxiosRequest(HttpRequestConfig)
    },
    GetClinicianAssignedUserHealthRecords: async (userid, token) => {
      const HttpRequestConfig = ConfigGenerator.GetClinicianAssignedUserHealthRecordsHttpRequestConfig(
        userid,
        token
      )

      return await makeV2AxiosRequest(HttpRequestConfig)
    },
    GetClinicianAssignedUserMealRecords: async (userid, token) => {
      const HttpRequestConfig = ConfigGenerator.GetClinicianAssignedUserMealRecordsHttpRequestConfig(
        userid,
        token
      )

      return await makeV2AxiosRequest(HttpRequestConfig)
    }

  }
}

export default HttpRequest

// export class HttpRequest {
//   constructor (url, requestType, body = undefined) {
//     this.url = url
//     this.requestType = requestType
//     this.body = body
//   }

//   async makeRequest () {
//     if (!!this.requestType || !!this.url) {
//       throw Error('Request or URL cannot be empty')
//     }

//     if (this.requestType === REQUESTTYPES.POST && !!this.body) {
//       throw Error('Post Request must have request body')
//     }

//     const responseObj = {
//       data: undefined,
//       error: false,
//       message: undefined
//     }

//     try {
//       let response
//       switch (this.requestType) {
//         case REQUESTTYPES.POST:
//           response = await axios.post(this.url, this.body)
//           break
//         case REQUESTTYPES.GET:
//           response = await axios.get(this.url)
//           break
//         default:
//           throw Error('Request Type not supported')
//       }
//       return { ...responseObj, data: response.data, message: 'ok' }
//     } catch (error) {
//       return { ...responseObj, error: true, message: error.toString() }
//     }
//   }
// }
