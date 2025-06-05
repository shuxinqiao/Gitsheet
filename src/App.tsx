import { useState } from 'react'
import './App.css'

import Gallery from './components/Gallery';
import UploadForm from './components/UploadForm';

function App() {
  return (
    <>
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-center my-8">🎵 Gitsheet Music Sheet management</h1>
      </div>
      <Gallery />
      <UploadForm />
    </>
  )
}

export default App
