import { NextRequest, NextResponse } from 'next/server'

// Store active connections
const connections = new Set<ReadableStreamDefaultController>()

function broadcastMessage(message: any) {
  const encoder = new TextEncoder()
  const data = `data: ${JSON.stringify(message)}\n\n`
  
  connections.forEach(controller => {
    try {
      controller.enqueue(encoder.encode(data))
    } catch (error) {
      // Remove closed connections
      connections.delete(controller)
    }
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const stream = searchParams.get('stream')
  
  if (stream === 'true') {
    const encoder = new TextEncoder()
    
    const stream = new ReadableStream({
      start(controller) {
        // Add this connection to the set
        connections.add(controller)
        
        // Send initial connection message
        const data = `data: ${JSON.stringify({ 
          id: Date.now(), 
          timestamp: new Date().toISOString(),
          message: 'Connection established',
          type: 'system'
        })}\n\n`
        controller.enqueue(encoder.encode(data))
        
        // Clean up connection after 5 minutes
        const timeoutId = setTimeout(() => {
          connections.delete(controller)
          controller.close()
        }, 300000)
        
        // Store cleanup function
        return () => {
          clearTimeout(timeoutId)
          connections.delete(controller)
        }
      },
      cancel(controller) {
        connections.delete(controller)
      }
    })
    
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apiKey',
      },
    })
  }
  
  // Return a single message for non-streaming requests
  return NextResponse.json({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    message: 'Single message response',
    type: 'data'
  })
}

export async function POST(request: NextRequest) {
  // Check API key authentication
  const apiKey = request.headers.get('apiKey')
  const validApiKey = process.env.API_KEY
  
  if (!apiKey || apiKey !== validApiKey) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid API key' },
      { status: 401 }
    )
  }
  
  const body = await request.json()
  
  // Create message object
  const message = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    message: body.message || 'Message received',
    type: body.type || 'received'
  }
  
  // Broadcast to all connected clients
  broadcastMessage(message)
  
  console.log('Received message:', body)
  
  return NextResponse.json(message)
}