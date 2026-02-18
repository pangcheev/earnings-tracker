#!/usr/bin/env node
/**
 * Simple Sync Server for Earnings Tracker
 * Allows devices on the same WiFi to sync session data
 * 
 * Usage: node sync-server.js
 * Then point devices to: http://YOUR_MAC_IP:3001
 */

const http = require('http')

let syncedSessions = null
let lastSyncTime = null

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // Sync upload: device sends its sessions
  if (req.method === 'POST' && req.url === '/sync-upload') {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        const data = JSON.parse(body)
        syncedSessions = data.sessions
        lastSyncTime = new Date().toISOString()
        
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ 
          success: true, 
          message: `Synced ${data.sessions.length} sessions`,
          timestamp: lastSyncTime 
        }))
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: false, error: err.message }))
      }
    })
    return
  }

  // Sync download: device gets latest sessions
  if (req.method === 'GET' && req.url === '/sync-download') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      sessions: syncedSessions || [],
      timestamp: lastSyncTime
    }))
    return
  }

  // Status/info endpoint
  if (req.method === 'GET' && req.url === '/sync-status') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      ready: true,
      sessionCount: syncedSessions ? syncedSessions.length : 0,
      lastSyncTime: lastSyncTime,
      message: 'Earnings Tracker Sync Server Ready'
    }))
    return
  }

  res.writeHead(404)
  res.end('Not found')
})

const PORT = 3001
server.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📱 Earnings Tracker Sync Server Running')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`\n✅ Server ready on port ${PORT}`)
  console.log(`\n📡 Connect from phone/desktop:`)
  console.log(`   http://192.168.0.158:3001`)
  console.log(`\nEndpoints:`)
  console.log(`   POST /sync-upload   - Upload sessions to sync`)
  console.log(`   GET  /sync-download - Download latest sessions`)
  console.log(`   GET  /sync-status   - Check server status`)
  console.log(`\n⏸️  Press Ctrl+C to stop\n`)
})

process.on('uncaughtException', (err) => {
  console.error('Server error:', err)
})
