const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const Database = require('better-sqlite3')

const app = express()
const server = http.createServer(app)
const io = new Server(server,{ cors:{ origin:'*' } })

const db = new Database('rekber.db')

app.use(express.json())

app.get('/invoices',(req,res)=>{
    const rows = db.prepare('SELECT * FROM invoices ORDER BY created DESC').all()
    res.json(rows)
})

app.post('/update',(req,res)=>{
    const { id } = req.body
    const inv = db.prepare('SELECT * FROM invoices WHERE id=?').get(id)
    if(inv) io.emit('update',inv)
    res.json({ ok:true })
})

io.on('connection',socket=>{
    socket.emit('init',
        db.prepare('SELECT * FROM invoices ORDER BY created DESC').all()
    )
})

server.listen(3000)