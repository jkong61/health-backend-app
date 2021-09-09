/* eslint-disable no-unused-vars */
/* eslint-disable no-tabs */
import { Dialog, Transition } from '@headlessui/react'
import React, { Fragment, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  FOOD_NUTRITIONS,
  processNutritionName
} from 'utilities/NutritionHelper'
import { ReactComponent as SearchLogo } from 'svgs/search.svg'
import { XCircleIcon } from '@heroicons/react/solid'

function NutritionModal ({
  show,
  toggleModal,
  selectedNutritions,
  foodNutritions,
  setFoodNutritions
}) {
  const cancelButtonRef = useRef()
  const [viewAll, setViewAll] = useState(false)
  const [query, setQuery] = useState('')
  const [filterNutritionDesc, setFilterNutritionDesc] = useState([])
  const foodNutritionsDesc = FOOD_NUTRITIONS.map(
    (f) => f.nutrition.nutrition_name
  )

  // clear the query text
  const clearQueryText = () => {
    setQuery('')
    handleNutritionKeyPress('')
  }

  const myToggleModal = () => {
    setViewAll(false)
    setFilterNutritionDesc([])
    toggleModal()
  }

  const selectHandler = (nutCode) => {
    setFoodNutritions(
      foodNutritions.map((f) => {
        if (f.nutrition.nutrition_code === nutCode) {
          return { ...f, selected: !f.selected }
        }
        return f
      })
    )
    // copy nutriton state
    const currentNutrition = selectedNutritions

    // find the existing index from array
    const index = currentNutrition.findIndex((n) => n === nutCode)
    if (index !== -1) {
      // remove the uncheck nutrition
      currentNutrition.splice(index, 1)
    } else {
      // add the new check nutrition
      currentNutrition.push(nutCode)
    }
  }

  const handleNutritionKeyPress = (val) => {
    // search food from all foods
    setQuery(val)
    const result = foodNutritionsDesc.filter(
      (desc) => desc.toLowerCase().indexOf(val.toLowerCase()) > -1
    )
    setFilterNutritionDesc(result)
  }

  const renderNutritionChip = () => {
    const minNumberToShow = 16
    let count = 0
    if (viewAll) {
      return foodNutritions.map((n) => {
        if (
          filterNutritionDesc.length === 0 ||
          filterNutritionDesc.includes(n.nutrition.nutrition_name)
        ) {
          return (
            <button
              key={n.nutrition.nutrition_code}
              onClick={() => selectHandler(n.nutrition.nutrition_code)}
              className={`px-2 py-1 text-xs mr-1 rounded-lg mt-1 focus:outline-none ${
                n.selected
                  ? 'gradient-bg-5 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}>
              {`${processNutritionName(n)} (${
                n.nutrition.nutrition_measurement_suffix
              })`}
            </button>
          )
        }
        return null
      })
    } else {
      return foodNutritions.map((n) => {
        if (
          count < minNumberToShow &&
          (filterNutritionDesc.length === 0 ||
            filterNutritionDesc.includes(n.nutrition.nutrition_name))
        ) {
          ++count
          return (
            <button
              key={n.nutrition.nutrition_code}
              onClick={() => selectHandler(n.nutrition.nutrition_code)}
              className={`px-2 py-1 text-xs mr-1 rounded-lg mt-2 focus:outline-none ${
                n.selected
                  ? 'gradient-bg-5 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}>
              <div className='flex justify-center items-center h-5'>
                {`${processNutritionName(n)} (${
                  n.nutrition.nutrition_measurement_suffix
                })`}
              </div>
            </button>
          )
        }
        return null
      })
    }
  }

  return (
    <div>
      <Transition show={show} as={Fragment}>
        <Dialog
          as='div'
          id='modal2'
          className='fixed inset-0 z-30 overflow-y-auto'
          initialFocus={cancelButtonRef}
          static
          open={show}
          onClose={myToggleModal}>
          <div className='min-h-screen px-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0'
              enterTo='opacity-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'>
              <Dialog.Overlay className='fixed inset-0 opacity-70 bg-black' />
            </Transition.Child>
            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className='inline-block h-screen align-middle'
              aria-hidden='true'>
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'>
              <div className='inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl'>
                <Dialog.Title
                  as='h3'
                  className='text-lg font-medium leading-6 dark-enabled-text'>
                  Nutritions
                </Dialog.Title>
                <p className='my-2 text-indigo-500 text-sm font-medium'>
                  Please choose the nutrition that you want to see.
                </p>
                <div className='relative flex items-center w-full lg:w-48 h-full group'>
                  <SearchLogo />
                  <input
                    type='text'
                    className='block w-full py-1.5 pl-10 pr-6 leading-normal rounded-lg focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 ring-opacity-90 bg-gray-100 dark:bg-gray-700 text-gray-400 aa-input'
                    placeholder='Search'
                    value={query}
                    onChange={(e) => handleNutritionKeyPress(e.target.value)}
                  />
                  {query !== '' && (
                    <XCircleIcon
                      className='h-6 w-6 absolute right-0 mr-2 text-red-400 cursor-pointer'
                      onClick={clearQueryText}
                    />
                  )}
                </div>

                <div className='flex flex-col mt-2 justify-center border-b-1 pb-4'>
                  <div>{renderNutritionChip()}</div>
                  <div className='mt-4 self-center'>
                    {!viewAll && (
                      <button
                        className='bg-indigo-400 px-2 text-white rounded-md py-1 text-xs'
                        onClick={() => setViewAll(true)}>
                        <p>See more</p>
                      </button>
                    )}
                  </div>
                  <p className='dark-enabled-text self-start mt-5 text-sm'>
                    You have selected{' '}
                    <span className='text-indigo-500 font-medium'>
                      {selectedNutritions.length}
                    </span>{' '}
                    items.{' '}
                  </p>
                </div>

                <div className='mt-4 flex justify-end'>
                  <button
                    type='button'
                    className='inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500'
                    onClick={myToggleModal}>
                    OK
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

NutritionModal.propTypes = {
  show: PropTypes.bool,
  toggleModal: PropTypes.func,
  selectedNutritions: PropTypes.array,
  foodNutritions: PropTypes.array,
  setFoodNutritions: PropTypes.func
}

export default NutritionModal
