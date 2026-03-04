const express = require('express')
const axios = require('axios')
const router = express.Router()

// Ollama 配置
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b'

let isAvailable = false

/**
 * 检查 Ollama 服务状态
 */
async function checkOllamaStatus() {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, {
      timeout: 5000
    })
    isAvailable = response.status === 200
    return isAvailable
  } catch (error) {
    isAvailable = false
    return false
  }
}

/**
 * 获取服务状态
 */
router.get('/status', async (req, res) => {
  const status = await checkOllamaStatus()
  res.json({
    available: status,
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL
  })
})

/**
 * 对话接口
 */
router.post('/chat', async (req, res) => {
  const { messages = [], stream = false } = req.body

  if (!messages.length || !messages[messages.length - 1]?.content) {
    return res.status(400).json({ error: '缺少消息内容' })
  }

  try {
    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/chat`,
      {
        model: OLLAMA_MODEL,
        messages: messages,
        stream: stream
      },
      {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        timeout: 120000
      }
    )

    res.json({
      content: response.data.message?.content || '',
      model: response.data.model || OLLAMA_MODEL,
      done: response.data.done || true
    })
  } catch (error) {
    console.error('Ollama: 对话请求失败 -', error.message)
    res.status(500).json({ 
      error: 'AI 服务不可用',
      details: error.message
    })
  }
})

/**
 * 简单问答
 */
router.post('/ask', async (req, res) => {
  const { question } = req.body

  if (!question) {
    return res.status(400).json({ error: '缺少问题内容' })
  }

  try {
    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/chat`,
      {
        model: OLLAMA_MODEL,
        messages: [{ role: 'user', content: question }],
        stream: false
      },
      {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        timeout: 120000
      }
    )

    res.json({ 
      answer: response.data.message?.content || '',
      model: response.data.model || OLLAMA_MODEL
    })
  } catch (error) {
    console.error('Ollama: 问答请求失败 -', error.message)
    res.status(500).json({ 
      error: 'AI 服务不可用',
      details: error.message
    })
  }
})

/**
 * 文本摘要
 */
router.post('/summarize', async (req, res) => {
  const { text, maxLength = 200 } = req.body

  if (!text) {
    return res.status(400).json({ error: '缺少文本内容' })
  }

  try {
    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/chat`,
      {
        model: OLLAMA_MODEL,
        messages: [{ 
          role: 'user', 
          content: `请总结以下内容，保持在${maxLength}字以内：\n\n${text}` 
        }],
        stream: false
      },
      {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        timeout: 120000
      }
    )

    res.json({ 
      summary: response.data.message?.content || '',
      model: response.data.model || OLLAMA_MODEL
    })
  } catch (error) {
    console.error('Ollama: 摘要请求失败 -', error.message)
    res.status(500).json({ 
      error: 'AI 服务不可用',
      details: error.message
    })
  }
})

/**
 * 任务建议
 */
router.post('/suggest-tasks', async (req, res) => {
  const { context, count = 5 } = req.body

  try {
    const prompt = context 
      ? `基于以下背景，给我${count}个具体的任务建议（用列表格式）：\n\n${context}`
      : `给我${count}个提高效率的任务建议（用列表格式）`

    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/chat`,
      {
        model: OLLAMA_MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: false
      },
      {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        timeout: 120000
      }
    )

    res.json({ 
      suggestions: response.data.message?.content || '',
      model: response.data.model || OLLAMA_MODEL
    })
  } catch (error) {
    console.error('Ollama: 任务建议请求失败 -', error.message)
    res.status(500).json({ 
      error: 'AI 服务不可用',
      details: error.message
    })
  }
})

/**
 * 打卡分析
 */
router.post('/analyze-checkin', async (req, res) => {
  const { rating, items = [] } = req.body

  if (rating === undefined) {
    return res.status(400).json({ error: '缺少评分' })
  }

  try {
    const itemsText = items.length > 0 ? items.join('、') : '无'
    const prompt = `我今天的打卡评分是${rating}/10 分。完成的事项：${itemsText}。请给我一些鼓励和建议，保持简短积极。`

    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/chat`,
      {
        model: OLLAMA_MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: false
      },
      {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        timeout: 120000
      }
    )

    res.json({ 
      analysis: response.data.message?.content || '',
      model: response.data.model || OLLAMA_MODEL
    })
  } catch (error) {
    console.error('Ollama: 打卡分析请求失败 -', error.message)
    res.status(500).json({ 
      error: 'AI 服务不可用',
      details: error.message
    })
  }
})

// 初始化时检查状态
checkOllamaStatus().then(status => {
  console.log(`Ollama: 服务${status ? '可用' : '不可用'}, 模型：${OLLAMA_MODEL}`)
})

module.exports = router
