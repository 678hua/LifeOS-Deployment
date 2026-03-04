const express = require('express')
const axios = require('axios')
const router = express.Router()

// 飞书配置（从环境变量读取）
const FEISHU_APP_ID = process.env.FEISHU_APP_ID || ''
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET || ''

let tenantAccessToken = null
let tokenExpireTime = 0

/**
 * 获取飞书租户访问令牌
 */
async function getTenantAccessToken() {
  const now = Date.now()
  
  // 如果 token 未过期，直接返回
  if (tenantAccessToken && now < tokenExpireTime) {
    return tenantAccessToken
  }

  try {
    const response = await axios.post(
      'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
      {
        app_id: FEISHU_APP_ID,
        app_secret: FEISHU_APP_SECRET
      },
      {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }
    )

    const data = response.data
    if (data.code === 0) {
      tenantAccessToken = data.tenant_access_token
      // 令牌有效期 2 小时，提前 10 分钟刷新
      tokenExpireTime = now + (data.expire - 600) * 1000
      console.log('Feishu: 获取 token 成功')
      return tenantAccessToken
    } else {
      console.error('Feishu: 获取 token 失败 -', data.msg)
      return null
    }
  } catch (error) {
    console.error('Feishu: 获取 token 异常 -', error.message)
    return null
  }
}

/**
 * 发送飞书消息
 */
router.post('/send-message', async (req, res) => {
  const { openId, msgType = 'text', content, replyId } = req.body

  if (!openId || !content) {
    return res.status(400).json({ error: '缺少必要参数：openId, content' })
  }

  const token = await getTenantAccessToken()
  if (!token) {
    return res.status(500).json({ error: '获取飞书 token 失败' })
  }

  try {
    const response = await axios.post(
      'https://open.feishu.cn/open-apis/im/v1/messages',
      {
        receive_id: openId,
        msg_type: msgType,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        ...(replyId && { reply_id: replyId })
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${token}`
        }
      }
    )

    const data = response.data
    if (data.code === 0) {
      res.json({ success: true, messageId: data.data.message_id })
    } else {
      res.status(500).json({ error: data.msg })
    }
  } catch (error) {
    console.error('Feishu: 发送消息异常 -', error.message)
    res.status(500).json({ error: '发送消息失败：' + error.message })
  }
})

/**
 * 发送打卡提醒
 */
router.post('/checkin-reminder', async (req, res) => {
  const { openId, title, time } = req.body

  if (!openId || !title) {
    return res.status(400).json({ error: '缺少必要参数' })
  }

  const timeStr = time ? new Date(time).toLocaleString('zh-CN') : '未设置'
  const content = JSON.stringify({
    text: `📅 打卡提醒\n\n事项：${title}\n时间：${timeStr}\n\n记得按时完成哦！💪`
  })

  const token = await getTenantAccessToken()
  if (!token) {
    return res.status(500).json({ error: '获取飞书 token 失败' })
  }

  try {
    const response = await axios.post(
      'https://open.feishu.cn/open-apis/im/v1/messages',
      {
        receive_id: openId,
        msg_type: 'text',
        content
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${token}`
        }
      }
    )

    const data = response.data
    if (data.code === 0) {
      res.json({ success: true, messageId: data.data.message_id })
    } else {
      res.status(500).json({ error: data.msg })
    }
  } catch (error) {
    console.error('Feishu: 发送打卡提醒异常 -', error.message)
    res.status(500).json({ error: '发送失败：' + error.message })
  }
})

/**
 * 发送任务提醒
 */
router.post('/task-reminder', async (req, res) => {
  const { openId, taskTitle, level = '中', deadline } = req.body

  if (!openId || !taskTitle) {
    return res.status(400).json({ error: '缺少必要参数' })
  }

  const levelEmoji = { '小': '🔹', '中': '🔶', '大': '🔴' }[level] || '📌'
  const deadlineStr = deadline ? new Date(deadline).toLocaleString('zh-CN') : '未设置'
  const content = JSON.stringify({
    text: `${levelEmoji} 任务提醒\n\n任务：${taskTitle}\n级别：${level}\n截止：${deadlineStr}\n\n加油！✨`
  })

  const token = await getTenantAccessToken()
  if (!token) {
    return res.status(500).json({ error: '获取飞书 token 失败' })
  }

  try {
    const response = await axios.post(
      'https://open.feishu.cn/open-apis/im/v1/messages',
      {
        receive_id: openId,
        msg_type: 'text',
        content
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${token}`
        }
      }
    )

    const data = response.data
    if (data.code === 0) {
      res.json({ success: true, messageId: data.data.message_id })
    } else {
      res.status(500).json({ error: data.msg })
    }
  } catch (error) {
    console.error('Feishu: 发送任务提醒异常 -', error.message)
    res.status(500).json({ error: '发送失败：' + error.message })
  }
})

/**
 * 发送每日总结
 */
router.post('/daily-summary', async (req, res) => {
  const { openId, rating, completedTasks, totalTasks, notes = [] } = req.body

  if (!openId || rating === undefined) {
    return res.status(400).json({ error: '缺少必要参数' })
  }

  const ratingEmoji = rating >= 9 ? '🌟' : (rating >= 7 ? '😊' : '💪')
  const notesText = notes.length > 0 
    ? notes.map(n => `• ${n}`).join('\n')
    : '今日暂无思记'

  const content = JSON.stringify({
    text: `${ratingEmoji} 每日总结\n\n今日评分：${rating}/10\n任务完成：${completedTasks}/${totalTasks}\n\n📝 思记：\n${notesText}\n\n继续保持！🚀`
  })

  const token = await getTenantAccessToken()
  if (!token) {
    return res.status(500).json({ error: '获取飞书 token 失败' })
  }

  try {
    const response = await axios.post(
      'https://open.feishu.cn/open-apis/im/v1/messages',
      {
        receive_id: openId,
        msg_type: 'text',
        content
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${token}`
        }
      }
    )

    const data = response.data
    if (data.code === 0) {
      res.json({ success: true, messageId: data.data.message_id })
    } else {
      res.status(500).json({ error: data.msg })
    }
  } catch (error) {
    console.error('Feishu: 发送每日总结异常 -', error.message)
    res.status(500).json({ error: '发送失败：' + error.message })
  }
})

/**
 * 测试连接
 */
router.get('/test', async (req, res) => {
  const token = await getTenantAccessToken()
  if (token) {
    res.json({ success: true, message: '飞书集成正常', configured: !!(FEISHU_APP_ID && FEISHU_APP_SECRET) })
  } else {
    res.status(500).json({ success: false, message: '飞书集成异常' })
  }
})

module.exports = router
