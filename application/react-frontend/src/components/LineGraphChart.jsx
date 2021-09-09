import React from 'react'
import { Bar } from 'react-chartjs-2'
import PropTypes from 'prop-types'
import { useThemeProvider } from 'providers/ThemeProvider'
import { ChartData, LineChartDataset, ChartOptions } from 'models/ChartModels'

// Testing Dummy Data
const DUMMYDATA = new ChartData(
  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'], [
    new LineChartDataset('My First dataset', [65, 59, 80, 81, 56, undefined, 150, 100], '#6366F1'),
    new LineChartDataset('My Second dataset', [50, 80, 20, 10, undefined, 40, 20, 45], '#ed64a6')
  ]
)

const LineGraphChart = ({ data, options, event }) => {
  // @ts-ignore
  const [themeState] = useThemeProvider()
  return (
    <div className="relative rounded-2xl h-full w-full">
      <Bar getElementAtEvent={event} data={data || DUMMYDATA} options={options || new ChartOptions(themeState)}/>
    </div>
  )
}

LineGraphChart.propTypes = {
  data: PropTypes.object.isRequired,
  options: PropTypes.object,
  event: PropTypes.func
}

export default LineGraphChart
