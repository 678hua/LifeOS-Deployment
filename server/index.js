const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const app = express()
const PORT = 3002

// 中间件
app.use(cors())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '../dist')))

// 飞书集成路由
const feishuRouter = require('./feishu')
app.use('/api/feishu', feishuRouter)

// Ollama AI 集成路由
const ollamaRouter = require('./ollama')
app.use('/api/ollama', ollamaRouter)

// 初始化数据库 - D 盘存储（避免 C 盘）
const DB_PATH = process.env.LIFEOS_DB_PATH || 'D:/LifeOS/data/lifeos.db'
const fs = require('fs')

// 确保数据库目录存在
const dbDir = path.dirname(DB_PATH)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const db = new sqlite3.Database(DB_PATH)

// 创建表
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS checkin_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS checkin_records (
    date TEXT PRIMARY KEY,
    items TEXT,
    rating INTEGER DEFAULT 0
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    level INTEGER,
    mo_points INTEGER,
    duration INTEGER,
    start_time TEXT,
    end_time TEXT,
    status INTEGER,
    category TEXT,
    created_at TEXT
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT,
    content TEXT,
    type INTEGER,
    created_at TEXT,
    reminder_time TEXT
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY,
    avatar_url TEXT,
    theme_mode INTEGER DEFAULT 0,
    mo_points_total INTEGER DEFAULT 0
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS lottery_prizes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    star INTEGER,
    icon TEXT,
    mo_point_value INTEGER DEFAULT 0,
    effect TEXT,
    created_at TEXT
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS lottery_records (
    id TEXT PRIMARY KEY,
    prize_id TEXT,
    prize_name TEXT,
    star INTEGER,
    draw_time TEXT,
    cost_mo_points INTEGER DEFAULT 0
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS user_lottery (
    id INTEGER PRIMARY KEY,
    free_draw_count INTEGER DEFAULT 3,
    last_free_draw_date TEXT
  )`)

  // 初始化默认奖品
  db.get('SELECT COUNT(*) as count FROM lottery_prizes', (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare(`INSERT INTO lottery_prizes (id, name, description, rarity, icon, mo_point_value, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      stmt.run('1', '幸运之星', '获得 500 墨点奖励', 0, '⭐', 500, new Date().toISOString())
      stmt.run('2', '欧皇附体', '获得 300 墨点奖励', 0, '👑', 300, new Date().toISOString())
      stmt.run('3', '好运连连', '获得 100 墨点奖励', 1, '🍀', 100, new Date().toISOString())
      stmt.run('4', '小确幸', '获得 50 墨点奖励', 1, '✨', 50, new Date().toISOString())
      stmt.run('5', '谢谢参与', '再接再厉', 2, '💪', 10, new Date().toISOString())
      stmt.run('6', '加油', '继续努力', 2, '🔥', 5, new Date().toISOString())
      stmt.finalize()
    }
  })

  // 初始化用户抽奖数据
  db.get('SELECT COUNT(*) as count FROM user_lottery WHERE id = 1', (err, row) => {
    if (!row || row.count === 0) {
      db.run('INSERT INTO user_lottery (id, free_draw_count) VALUES (1, 3)')
    }
  })
})

// ============ 打卡 API ============

app.get('/api/checkin/items', (req, res) => {
  db.all('SELECT * FROM checkin_items', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows || [])
  })
})

app.post('/api/checkin/items', (req, res) => {
  const { id, title, created_at } = req.body
  db.run('INSERT OR REPLACE INTO checkin_items (id, title, created_at) VALUES (?, ?, ?)',
    [id, title, created_at], (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ success: true })
    })
})

app.delete('/api/checkin/items/:id', (req, res) => {
  db.run('DELETE FROM checkin_items WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ success: true })
  })
})

app.get('/api/checkin/records/:date', (req, res) => {
  db.get('SELECT * FROM checkin_records WHERE date = ?', [req.params.date], (err, row) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(row || { date: req.params.date, items: '[]', rating: 0 })
  })
})

app.put('/api/checkin/records/:date', (req, res) => {
  const { items, rating } = req.body
  db.run('INSERT OR REPLACE INTO checkin_records (date, items, rating) VALUES (?, ?, ?)',
    [req.params.date, JSON.stringify(items), rating], (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ success: true })
    })
})

// ============ 任务 API ============

app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows || [])
  })
})

app.post('/api/tasks', (req, res) => {
  const task = req.body
  db.run(`INSERT OR REPLACE INTO tasks 
    (id, title, description, level, mo_points, duration, start_time, end_time, status, category, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [task.id, task.title, task.description, task.level, task.mo_points,
     task.duration, task.start_time, task.end_time, task.status, task.category, task.created_at],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ success: true })
    })
})

app.put('/api/tasks/:id', (req, res) => {
  const task = req.body
  db.run(`UPDATE tasks SET
    title = ?, description = ?, level = ?, mo_points = ?, duration = ?,
    start_time = ?, end_time = ?, status = ?, category = ?
    WHERE id = ?`,
    [task.title, task.description, task.level, task.mo_points, task.duration,
     task.start_time, task.end_time, task.status, task.category, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ success: true })
    })
})

app.delete('/api/tasks/:id', (req, res) => {
  db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ success: true })
  })
})

// ============ 思记 API ============

app.get('/api/notes', (req, res) => {
  db.all('SELECT * FROM notes', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows || [])
  })
})

app.post('/api/notes', (req, res) => {
  const note = req.body
  db.run(`INSERT OR REPLACE INTO notes 
    (id, title, content, type, created_at, reminder_time)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [note.id, note.title, note.content, note.type, note.created_at, note.reminder_time],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ success: true })
    })
})

app.put('/api/notes/:id', (req, res) => {
  const note = req.body
  db.run(`UPDATE notes SET title = ?, content = ?, type = ?, reminder_time = ? WHERE id = ?`,
    [note.title, note.content, note.type, note.reminder_time, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ success: true })
    })
})

app.delete('/api/notes/:id', (req, res) => {
  db.run('DELETE FROM notes WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ success: true })
  })
})

// ============ 抽奖 API ============

app.get('/api/lottery/prizes', (req, res) => {
  db.all('SELECT * FROM lottery_prizes', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows || [])
  })
})

app.post('/api/lottery/draw', (req, res) => {
  const { moPointCost = 10 } = req.body
  
  // 原神风格概率：5 星 0.6%, 4 星 5.1%, 3 星 94.3%
  const random = Math.random() * 100
  let star = 0  // 3 星
  if (random < 0.6) star = 2  // 5 星
  else if (random < 5.7) star = 1  // 4 星
  
  db.all('SELECT * FROM lottery_prizes WHERE star = ?', [star], (err, prizes) => {
    if (err) return res.status(500).json({ error: err.message })
    
    if (prizes.length === 0) {
      // 如果该星级没有奖品，降级到 3 星
      star = 0
      db.all('SELECT * FROM lottery_prizes WHERE star = ?', [0], (err, prizes) => {
        if (err) return res.status(500).json({ error: err.message })
        completeDraw(prizes[0])
      })
    } else {
      completeDraw(prizes[Math.floor(Math.random() * prizes.length)])
    }
    
    function completeDraw(selectedPrize) {
      const recordId = Date.now().toString()
      const record = {
        id: recordId,
        prize_id: selectedPrize.id,
        prize_name: selectedPrize.name,
        star: selectedPrize.star,
        draw_time: new Date().toISOString(),
        cost_mo_points: moPointCost
      }
      
      db.run(`INSERT INTO lottery_records 
        (id, prize_id, prize_name, star, draw_time, cost_mo_points)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [record.id, record.prize_id, record.prize_name, record.star, record.draw_time, record.cost_mo_points],
        (err) => {
          if (err) return res.status(500).json({ error: err.message })
          res.json({ prize: selectedPrize, record })
        })
    }
  })
})

app.get('/api/lottery/records', (req, res) => {
  db.all('SELECT * FROM lottery_records ORDER BY draw_time DESC LIMIT 100', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows || [])
  })
})

app.get('/api/lottery/user', (req, res) => {
  db.get('SELECT * FROM user_lottery WHERE id = 1', [], (err, user) => {
    if (err) return res.status(500).json({ error: err.message })
    
    const now = new Date()
    const lastDraw = user.last_free_draw_date ? new Date(user.last_free_draw_date) : null
    
    if (!lastDraw || lastDraw.getDate() !== now.getDate()) {
      db.run('UPDATE user_lottery SET free_draw_count = 3 WHERE id = 1')
      user.free_draw_count = 3
    }
    
    res.json(user)
  })
})

// ============ 用户配置 API ============

app.get('/api/profile', (req, res) => {
  db.get('SELECT * FROM user_profile WHERE id = 1', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message })
    let profile = row || { id: 1, avatar_url: null, theme_mode: 0, mo_points_total: 0 }
    if (!row) {
      db.run('INSERT INTO user_profile (id, theme_mode, mo_points_total) VALUES (1, 0, 0)')
    }
    res.json(profile)
  })
})

app.put('/api/profile', (req, res) => {
  const { avatar_url, theme_mode, mo_points_total } = req.body
  db.run(`UPDATE user_profile SET avatar_url = ?, theme_mode = ?, mo_points_total = ? WHERE id = 1`,
    [avatar_url, theme_mode, mo_points_total], (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ success: true })
    })
})

// 前端路由回退
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`LifeOS Server running on http://localhost:${PORT}`)
  console.log(`Database: ${DB_PATH}`)
})
