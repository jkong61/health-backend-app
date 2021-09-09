import React, { useState } from 'react'
import HttpHelper from 'utilities/HttpHelper'
import { ReactComponent as AppLogo } from 'svgs/applogo.svg'
import { ReactComponent as Spinner } from 'svgs/spinner.svg'
import { useAuthProvider, AuthProviderDispatchMethodConstants } from 'providers/AuthProvider'
import useLoading from 'utilities/customHooks/useLoading'

const Login = (props) => {
  const [loginDetail, setLoginDetail] = useState({
    email: '',
    password: ''
  })
  const [, dispatch] = useAuthProvider()
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const submitHandler = async (e) => {
    e.preventDefault()
    // const res = await HttpHelper.Get.GetFoods()
    // console.log(res)
    setError(false)
    try {
      const res = await HttpHelper.Post.Login(loginDetail.email, loginDetail.password)
      if (!res?.error && res?.data.access_token) {
        const token = res.data.access_token
        const data = await HttpHelper.Get.GetUserMe(token)
        if (data.data.account_type === 0) {
          throw Error('Incorrect username or password')
        }
        const payload = {
          token: token,
          isAuthenticated: true
        }
        localStorage.setItem('token', token)
        dispatch({ type: AuthProviderDispatchMethodConstants.SAVE_AUTH, payload: payload })
      } else {
        throw Error(res.message)
      }
    } catch (error) {
      console.log(error)
      setErrorMessage(error.toString())
      setError(true)
    }
  }

  const [handleLoginSubmit, loadingLogin] = useLoading(submitHandler)

  return (
    <div className="min-h-screen flex items-stretch text-white ">
      <div
        className="lg:flex w-1/2 hidden bg-gray-500 bg-no-repeat bg-cover relative items-center"
        // @ts-ignore
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1534801022022-6e319a11f249?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=701&q=80)'
        }}
      >
        <div className="absolute bg-black opacity-60 inset-0 z-0"></div>
        <div className="w-full px-24 z-10">
          <h1 className="text-5xl font-bold text-left tracking-wide">
            Lorem ipsum dolor
          </h1>
          <p className="text-3xl my-4">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellat quasi ullam quod ea pariatur.
          </p>
        </div>
      </div>
      <div
        className="lg:w-1/2 w-full flex items-center justify-center text-center md:px-16 px-0 z-0"
        // @ts-ignore
        style={{ backgroundColor: '#161616' }}
      >
        <div
          className="absolute lg:hidden z-10 inset-0 bg-gray-500 bg-no-repeat bg-cover items-center"
          // @ts-ignore
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1534801022022-6e319a11f249?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=701&q=80)'
          }}
        >
          <div className="absolute bg-black opacity-60 inset-0 z-0"></div>
        </div>
        <div className="w-full py-6 z-20 ">
          <div className="my-6 flex flex-col justify-center items-center">
            <AppLogo className="h-20 w-20" />
            <span className="m-4 text-3xl text-gray-100 font-bold tracking-wide">
              HealthOnline
            </span>
          </div>
          <form onSubmit={handleLoginSubmit} className="sm:w-2/3 w-full px-4 lg:px-0 mx-auto">
            <div className="pb-2 pt-4">
              <input
                type="text"
                name="email"
                id="email"
                required={true}
                placeholder="Email"
                className="block w-full p-4 text-lg rounded-sm bg-black focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) =>
                  setLoginDetail({ ...loginDetail, email: e.target.value })
                }
              />
            </div>
            <div className="pb-2 pt-4">
              <input
                className="block w-full p-4 text-lg rounded-sm bg-black focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                onChange={(e) =>
                  setLoginDetail({ ...loginDetail, password: e.target.value })
                }
              />
            </div>
            <div className="text-right text-gray-400 hover:underline hover:text-gray-100">
              <a href="#">Forgot your password?</a>
            </div>
            <div className="px-4 pb-2 pt-4">
              <button className="uppercase flex flex-row justify-center items-center h-12 w-full lg:p-2 p-4 text-lg rounded-full bg-indigo-500 hover:bg-indigo-600 focus:outline-none">
                {loadingLogin
                  ? <Spinner className="h-5 animate-spin mr-3"/>
                  : <span>Sign in</span>}
              </button>
            </div>
            {error && <p className="text-red-400">{errorMessage}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
