import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import BoardPage from './pages/BoardPage'

interface Session {
  roomCode: string
  myName: string
  isHost: boolean
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [initialCode, setInitialCode] = useState('')

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('room')
    if (code) setInitialCode(code.toUpperCase())
  }, [])

  const handleEnter = (roomCode: string, myName: string, isHost: boolean) => {
    setSession({ roomCode, myName, isHost })
    window.history.replaceState(null, '', `?room=${roomCode}`)
  }

  if (!session) {
    return <HomePage onEnter={handleEnter} initialCode={initialCode} />
  }

  return (
    <BoardPage
      roomCode={session.roomCode}
      myName={session.myName}
      isHost={session.isHost}
    />
  )
}
