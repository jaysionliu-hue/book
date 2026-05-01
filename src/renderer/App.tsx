import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import CreateBookModal from './components/CreateBookModal'
import { useStore } from './stores/useStore'

function App() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { currentBook, loadBooks, books } = useStore()

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  return (
    <div className="flex h-screen bg-content">
      <Sidebar onCreateBook={() => setShowCreateModal(true)} />
      <MainContent />
      
      {showCreateModal && (
        <CreateBookModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}

export default App
