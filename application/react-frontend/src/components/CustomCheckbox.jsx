import React from 'react'
import { CheckCircleIcon as SolidCheckIcon } from '@heroicons/react/solid'
import { CheckCircleIcon as OutlineCheckIcon } from '@heroicons/react/outline'
import PropTypes from 'prop-types'

const capitalizeFirstWord = (str) => {
  return str.split(' ').map(w => `${w[0].toUpperCase()}${w.slice(1)}`).join(' ')
}

function formatText (str) {
  // Special case just for BMI
  if (str === 'bmi') {
    return 'BMI'
  }
  return str.split('_').map(capitalizeFirstWord).join(' ')
}

const CustomCheckbox = ({ state, onClick, text }) => {
  return (
      <button className='flex m-4 focus:outline-none' onClick={onClick}>
          {state ? <SolidCheckIcon className='w-6 h-6 text-green-500'/> : <OutlineCheckIcon className='w-6 h-6 text-gray-300'/>}

          <p className={`px-4 ${state ? 'text-green-500' : 'dark-enabled-text'}`}>{formatText(text)}</p>
      </button>
  )
}

CustomCheckbox.propTypes = {
  state: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired
}

export default CustomCheckbox
