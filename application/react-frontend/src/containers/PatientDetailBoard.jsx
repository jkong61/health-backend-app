/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
/* eslint-disable react/display-name */
import React, { useEffect, useState } from 'react'
import GridContentCardContainer from 'containers/Content/GridContentCardContainer'
import PatientProfileDetail from 'components/PatientProfileDetail'
import PatientMealHealthBoard from 'components/PatientMealHealthBoard'
import HttpHelper from 'utilities/HttpHelper'
import { useAuthProvider } from 'providers/AuthProvider'
import useLoading from 'utilities/customHooks/useLoading'
import { useParams, useHistory } from 'react-router-dom'

const PatientDetailBoard = () => {
  const [patientInfo, setPatientInfo] = useState({
    info: undefined,
    profile: undefined
  })
  const history = useHistory()
  const [authState] = useAuthProvider()
  const { id } = useParams()

  async function fetchPatientData (patientId) {
    try {
      const [profile, info] = await Promise.all([
        HttpHelper.Get.GetClinicianAssignedUserHealthProfile(
          patientId,
          authState.token
        ),
        HttpHelper.Get.GetUserById(patientId, authState.token)
      ])
      setPatientInfo({
        info: info,
        profile: profile
      })
    } catch (err) {
      console.log(err)
    }
  }

  const [getPatientData, loading] = useLoading(fetchPatientData)

  useEffect(() => {
    getPatientData(id)
  }, [])

  return (
    <div className='grid md:grid-cols-5 md:auto-rows-auto gap-4'>
      <div className='col-span-2 md:col-span-2'>
        <GridContentCardContainer>
          {!loading && (
            <PatientProfileDetail
              title={'Patient Profile'}
              data={patientInfo}
            />
          )}
        </GridContentCardContainer>
      </div>
      <div className='col-span-2 md:col-span-3'>
        <GridContentCardContainer>
          {!loading && (
            <PatientMealHealthBoard
              title={'Meal & Health History'}
              patientId={id}
            />
          )}
        </GridContentCardContainer>
      </div>
    </div>
  )
}

export default PatientDetailBoard
