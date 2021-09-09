/* eslint-disable no-unused-vars */
import React, { useState, useReducer } from 'react'
import CustomCheckbox from 'components/CustomCheckbox'
import TwoSelections from 'components/TwoSelections'
import { ExclamationCircleIcon } from '@heroicons/react/solid'
import { ReactComponent as Spinner } from 'svgs/spinner.svg'
import {
  useReportProvider,
  ReportProviderDispatchMethodConstants
} from 'providers/ReportProvider'

export const TrendFeatures = [
  'waist_circumference',
  'bmi',
  'blood_pressure_medication',
  'physical_exercise',
  'smoking',
  'vegetable_fruit_berries_consumption',
  'fasting_blood_glucose'
]

const defaultTrendAnalyserConfig = {
  selected_features: [],
  ranking_type_top_n: true,
  ranking_ascending: true,
  threshold: 0
}

const TrendAnalyzer = () => {
  const [trendFeatures] = useState(TrendFeatures)
  const [reportState, reportDispatch] = useReportProvider()
  const [localSelectedFeatures, dispatchSelectedFeatures] = useReducer(
    featuresReducer,
    defaultTrendAnalyserConfig
  )

  return (
    <>
      <div className='container mx-auto px-4 sm:px-8'>
        {console.log(reportState)}
        <div className='flex justify-between pt-4'>
          <h2 className='font-bold text-xl leading-tight dark-enabled-text'>
            Trend Analyzer
          </h2>
        </div>
        <div className='mt-5 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg'>
          <p className='dark-enabled-text text-lg font-medium'>
            Please select features that you want to analyze.
          </p>
          {trendFeatures.map((value, index) => (
            <CustomCheckbox
              text={value}
              key={index}
              state={localSelectedFeatures.selected_features?.includes(value)}
              onClick={() => {
                dispatchSelectedFeatures({
                  type: localSelectedFeatures.selected_features?.includes(value)
                    ? 'removefeature'
                    : 'addfeature',
                  payload: value
                })
              }}
            />
          ))}
          <div className='flex justify-center mt-5 text-indigo-500 p-2'>
            <ExclamationCircleIcon className='h-6 w-6 ' />
            {localSelectedFeatures.selected_features?.length > 0
              ? (
              <p className='px-2'>{`Selected ${localSelectedFeatures.selected_features?.length} features.`}</p>
                )
              : (
              <p className='px-2'>{'Nothing selected.'}</p>
                )}
          </div>
        </div>
      </div>
      <div className='container mx-auto px-4 sm:px-8'>
        <div className='mt-5 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg'>
          <div className='flex justify-between py-1'>
            <p className='dark-enabled-text'>Ranking Type Top</p>
            <TwoSelections
              choice={localSelectedFeatures.ranking_type_top_n}
              select1={false}
              select2={true}
              press1={() =>
                dispatchSelectedFeatures({
                  type: 'changerankingtype',
                  payload: false
                })
              }
              press2={() =>
                dispatchSelectedFeatures({
                  type: 'changerankingtype',
                  payload: true
                })
              }
            />
          </div>
          <div className='flex justify-between py-1'>
            <p className='dark-enabled-text'>Ranking Ascending</p>
            <TwoSelections
              choice={localSelectedFeatures.ranking_ascending}
              select1={false}
              select2={true}
              press1={() =>
                dispatchSelectedFeatures({
                  type: 'changerankingascending',
                  payload: false
                })
              }
              press2={() =>
                dispatchSelectedFeatures({
                  type: 'changerankingascending',
                  payload: true
                })
              }
            />
          </div>
          <div className='flex flex-col py-1'>
            <p className='dark-enabled-text'>Threshold: <span className='text-indigo-400 px-5'>{localSelectedFeatures.threshold}</span></p>
            <input
              className='mt-2'
              min={0}
              max={10}
              step={1}
              type='range'
              value={localSelectedFeatures.threshold}
              onChange={(e) =>
                dispatchSelectedFeatures({
                  type: 'changethreshold',
                  payload: e.target.value
                })
              }
            />
          </div>
        </div>
        <div className='flex justify-center my-2'>
          <button
            className='gradient-bg-3 text-white py-2 px-20 mt-5 rounded-lg'
            onClick={() =>
              reportDispatch({
                type: ReportProviderDispatchMethodConstants.GENERATEREPORT,
                payload: localSelectedFeatures
              })
            }>
            {reportState?.trend?.loading
              ? (
              <div className='flex'>
                <Spinner className='h-5 w-5 mr-3' />
                Generating Report...
              </div>
                )
              : (
              <div>Generate Report</div>
                )}
          </button>
        </div>
      </div>
    </>
  )
}

export default TrendAnalyzer

function featuresReducer (state, action) {
  let features

  switch (action.type) {
    case 'addfeature':
      features = [...state.selected_features]
      if (!features?.includes(action.payload)) {
        features.push(action.payload)
      }
      return {
        selected_features: [...features],
        ranking_type_top_n: state.ranking_type_top_n,
        ranking_ascending: state.ranking_ascending,
        threshold: state.threshold
      }
    case 'removefeature':
      features = [...state.selected_features]
      if (features?.includes(action.payload)) {
        features = features.filter((item) => item !== action.payload)
      }
      return {
        selected_features: [...features],
        ranking_type_top_n: state.ranking_type_top_n,
        ranking_ascending: state.ranking_ascending,
        threshold: state.threshold
      }
    case 'changerankingtype':
      return {
        selected_features: state.selected_features,
        ranking_type_top_n: action.payload,
        ranking_ascending: state.ranking_ascending,
        threshold: state.threshold
      }
    case 'changerankingascending':
      return {
        selected_features: state.selected_features,
        ranking_type_top_n: state.ranking_type_top_n,
        ranking_ascending: action.payload,
        threshold: state.threshold
      }
    case 'changethreshold':
      return {
        selected_features: state.selected_features,
        ranking_type_top_n: state.ranking_type_top_n,
        ranking_ascending: state.ranking_ascending,
        threshold: action.payload
      }
    case 'reset':
      return defaultTrendAnalyserConfig
    default:
      return state
  }
}
