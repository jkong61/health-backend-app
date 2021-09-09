import { useEffect, useState, useRef } from 'react'

/** Custom React Hook for abstracting loading components
 * @param {function} action - Function passed must always be an async function
 * @returns {Array} [action, loading] - action to be used, loading state that is listening to the action
 */
export default function useLoading (action) {
  const [loading, setLoading] = useState(false)
  const isCurrent = useRef(true)

  useEffect(() => () => {
    isCurrent.current = false
  }, [])

  const doAction = (...args) => {
    setLoading(true)
    return action(...args).finally(() => {
      if (isCurrent.current) {
        setLoading(false)
      }
    })
  }
  return [doAction, loading]
}
