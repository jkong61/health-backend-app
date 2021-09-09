/* eslint-disable no-unused-vars */
import React from 'react'
import GridContentCardContainer from 'containers/Content/GridContentCardContainer'
import TrendAnalyzer from 'components/TrendAnalyzer'
import ReportBoard from 'components/ReportBoard'

const TrendAnalyzerBoard = () => {
  return (
    <div className='grid md:grid-cols-2 md:auto-rows-auto gap-4'>
      <div className='col-span-1'>
        <GridContentCardContainer>
          <TrendAnalyzer />
        </GridContentCardContainer>
      </div>
      <div className='col-span-1 md:col-span-1'>
        <GridContentCardContainer>
          <ReportBoard />
        </GridContentCardContainer>
      </div>
    </div>
  )
}

export default TrendAnalyzerBoard
