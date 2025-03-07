import React from 'react'
import './App.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import Layout from './Layout'
import Dashbord from './pages/Dashbord'
import ContextProvider from './context/IndexContext'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout />}>
      <Route path="" element={<Dashbord />} />
    </Route>
  )
)

function App() {

  return (
    <ContextProvider>
      <RouterProvider router={router} />
    </ContextProvider>
  )
}

export default App
