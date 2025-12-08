import { useState, useEffect } from 'react'

export default function Home() {
  const [status, setStatus] = useState<string>('Loading...')

  useEffect(() => {
    fetch('/api/about.json')
      .then(res => res.json())
      .then(data => {
        setStatus(`Server running - ${data.server.services.length} services available`)
      })
      .catch(err => {
        setStatus('Server error')
      })
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>AREA Backend Server</h1>
      <p>Status: {status}</p>
      <p>API Endpoints:</p>
      <ul>
        <li>GET /api/about.json - Server info</li>
        <li>POST /api/auth/register - User registration</li>
        <li>POST /api/auth/login - User login</li>
        <li>GET /api/services - Available services</li>
        <li>GET /api/areas - User areas</li>
        <li>POST /api/hooks/start - Start hook engine</li>
      </ul>
    </div>
  )
}