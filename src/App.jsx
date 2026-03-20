import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'
import Main from './components/main/Main'
import ReportForm from './components/reportForm/ReportForm'
import ContextProvider from './context/Context'

const App = () => {
  return (
    <ContextProvider>
      <Routes>
        <Route path="/" element={
            <div style={{display: 'flex', width: '100%'}}>
                <div className="hidden md:block">
                    <Sidebar />
                </div>
                <Main />
            </div>
        } />
        <Route path="/report" element={<ReportForm />} />
      </Routes>
    </ContextProvider>
  )
}

export default App