import { useState } from 'react'
import HomePage from './pages/HomePage'
import BoardPage from './pages/BoardPage'

interface Session {
  roomCode: string
  myName: string
  isHost: boolean
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  const handleEnter = (roomCode: string, myName: string, isHost: boolean) => {
    setSession({ roomCode, myName, isHost })
  }

  if (!session) {
    return <HomePage onEnter={handleEnter} />
  }

  return (
    <BoardPage
      roomCode={session.roomCode}
      myName={session.myName}
      isHost={session.isHost}
    />
  )
}
