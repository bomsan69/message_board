'use client'

import { useState, useEffect, useRef } from 'react'
import './globals.css'

interface Message {
  id: number
  timestamp: string
  message: string
  type: string
}

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)
  const maxVisibleMessages = 20 // Adjust based on screen height

  useEffect(() => {
    const eventSource = new EventSource('/api/message?stream=true')
    
    eventSource.onopen = () => {
      setIsConnected(true)
    }
    
    eventSource.onmessage = (event) => {
      const newMessage: Message = JSON.parse(event.data)
      
      setMessages(prev => {
        const updated = [...prev, newMessage]
        // Remove first message if exceeding max visible messages
        if (updated.length > maxVisibleMessages) {
          return updated.slice(1)
        }
        return updated
      })
    }
    
    eventSource.onerror = () => {
      setIsConnected(false)
    }
    
    return () => {
      eventSource.close()
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollTop = tableRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Message Dashboard</h1>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            <span className="text-sm text-gray-400 ml-4">
              Messages: {messages.length}
            </span>
          </div>
        </div>

        <div 
          ref={tableRef}
          className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
          style={{ height: 'calc(100vh - 200px)' }}
        >
          <div className="overflow-y-auto h-full">
            <table className="w-full">
              <thead className="bg-gray-700 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message, index) => (
                  <tr 
                    key={message.id} 
                    className={`${
                      index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'
                    } hover:bg-gray-600 transition-colors duration-200`}
                  >
                    <td className="px-4 py-3 font-mono text-gray-300 border-b border-gray-700">
                      {message.id}
                    </td>
                    <td className="px-4 py-3 text-gray-300 border-b border-gray-700">
                      {new Date(message.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 border-b border-gray-700">
                      <span className={`inline-flex px-2 py-1 font-semibold rounded-full ${
                        message.type === 'system' 
                          ? 'bg-blue-100 text-blue-800' 
                          : message.type === 'data'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {message.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 border-b border-gray-700">
                      {message.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {messages.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>Waiting for messages...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}