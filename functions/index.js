/**
 * ESA Pages 边缘函数统一入口
 * 使用 KV 存储实现评论、留言板等持久化功能
 */

// CORS 响应头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// JSON 响应工具函数
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// 生成简易ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ==================== 评论处理 ====================
async function handleComments(request, url, env) {
  const pathParts = url.pathname.split('/').filter(Boolean)
  // /api/comments/:postId 或 /api/comments/:id/like
  const kv = env?.KV_NAMESPACE

  if (request.method === 'GET' && pathParts.length === 3) {
    // GET /api/comments/:postId
    const postId = pathParts[2]
    if (kv) {
      const raw = await kv.get(`comments:${postId}`, 'json')
      return jsonResponse(raw || [])
    }
    return jsonResponse([])
  }

  if (request.method === 'POST' && pathParts.length === 4 && pathParts[3] === 'like') {
    // POST /api/comments/:id/like
    const commentId = pathParts[2]
    if (kv) {
      const allKeys = await kv.list({ prefix: 'comments:' })
      for (const key of allKeys.keys) {
        const comments = await kv.get(key.name, 'json') || []
        const comment = comments.find(c => c.id === commentId)
        if (comment) {
          comment.likes = (comment.likes || 0) + 1
          await kv.put(key.name, JSON.stringify(comments))
          return jsonResponse({ success: true, likes: comment.likes })
        }
      }
    }
    return jsonResponse({ success: true })
  }

  if (request.method === 'POST' && pathParts.length === 2) {
    // POST /api/comments
    const body = await request.json()
    const newComment = {
      id: generateId(),
      post_id: body.postId,
      author: body.author || '匿名',
      content: body.content,
      created_at: new Date().toISOString(),
      likes: 0,
    }
    if (kv) {
      const existing = await kv.get(`comments:${body.postId}`, 'json') || []
      existing.unshift(newComment)
      await kv.put(`comments:${body.postId}`, JSON.stringify(existing))
    }
    return jsonResponse({ id: newComment.id }, 201)
  }

  return jsonResponse({ error: '未找到' }, 404)
}

// ==================== 留言板处理 ====================
async function handleGuestbook(request, url, env) {
  const kv = env?.KV_NAMESPACE

  if (request.method === 'GET') {
    if (kv) {
      const raw = await kv.get('guestbook', 'json')
      return jsonResponse(raw || [])
    }
    return jsonResponse([])
  }

  if (request.method === 'POST') {
    const body = await request.json()
    const entry = {
      id: generateId(),
      author: body.author || '匿名',
      content: body.content,
      emoji: body.emoji || '😊',
      created_at: new Date().toISOString(),
    }
    if (kv) {
      const existing = await kv.get('guestbook', 'json') || []
      existing.unshift(entry)
      await kv.put('guestbook', JSON.stringify(existing))
    }
    return jsonResponse({ id: entry.id }, 201)
  }

  return jsonResponse({ error: '未找到' }, 404)
}

// ==================== 统计处理 ====================
async function handleStats(request, url, env) {
  const kv = env?.KV_NAMESPACE

  if (url.pathname === '/api/stats' && request.method === 'GET') {
    if (kv) {
      const stats = await kv.get('stats', 'json') || {
        totalVisits: 0,
        todayVisits: 0,
        postsCount: 0,
        notesCount: 0,
      }
      return jsonResponse(stats)
    }
    return jsonResponse({ totalVisits: 0, todayVisits: 0, postsCount: 0, notesCount: 0 })
  }

  if (url.pathname === '/api/visits' && request.method === 'POST') {
    if (kv) {
      const stats = await kv.get('stats', 'json') || { totalVisits: 0, todayVisits: 0 }
      stats.totalVisits += 1
      stats.todayVisits += 1
      await kv.put('stats', JSON.stringify(stats))
    }
    return jsonResponse({ success: true })
  }

  return jsonResponse({ error: '未找到' }, 404)
}

// ==================== 友链处理 ====================
async function handleLinks(request, url, env) {
  const kv = env?.KV_NAMESPACE
  const pathParts = url.pathname.split('/').filter(Boolean)

  if (request.method === 'GET') {
    if (kv) {
      const raw = await kv.get('links', 'json')
      return jsonResponse(raw || [])
    }
    return jsonResponse([])
  }

  if (request.method === 'POST') {
    const body = await request.json()
    const link = {
      id: generateId(),
      name: body.name,
      url: body.url,
      description: body.description || '',
      logo: body.logo || '',
    }
    if (kv) {
      const existing = await kv.get('links', 'json') || []
      existing.push(link)
      await kv.put('links', JSON.stringify(existing))
    }
    return jsonResponse({ id: link.id }, 201)
  }

  if (request.method === 'DELETE' && pathParts.length === 3) {
    const id = pathParts[2]
    if (kv) {
      const existing = await kv.get('links', 'json') || []
      const filtered = existing.filter(l => l.id !== id)
      await kv.put('links', JSON.stringify(filtered))
    }
    return jsonResponse({ success: true })
  }

  return jsonResponse({ error: '未找到' }, 404)
}

// ==================== 设置处理 ====================
async function handleSettings(request, url, env) {
  const kv = env?.KV_NAMESPACE
  const pathParts = url.pathname.split('/').filter(Boolean)
  const key = pathParts[2]

  if (!key) return jsonResponse({ error: '缺少设置键名' }, 400)

  if (request.method === 'GET') {
    if (kv) {
      const value = await kv.get(`settings:${key}`)
      return jsonResponse({ value })
    }
    return jsonResponse({ value: null })
  }

  if (request.method === 'PUT') {
    const body = await request.json()
    if (kv) {
      await kv.put(`settings:${key}`, body.value)
    }
    return jsonResponse({ success: true })
  }

  return jsonResponse({ error: '未找到' }, 404)
}

// ==================== AI 代理处理 ====================
async function handleAIProxy(request, url) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: '仅支持POST请求' }, 405)
  }

  const body = await request.json()
  const { provider, apiKey, model, messages } = body

  if (!apiKey || !messages) {
    return jsonResponse({ error: '缺少必要参数: apiKey, messages' }, 400)
  }

  // AI 提供商配置
  const providers = {
    qwen: {
      url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      authHeader: 'Authorization',
      authPrefix: 'Bearer ',
    },
    deepseek: {
      url: 'https://api.deepseek.com/v1/chat/completions',
      authHeader: 'Authorization',
      authPrefix: 'Bearer ',
    },
    kimi: {
      url: 'https://api.moonshot.cn/v1/chat/completions',
      authHeader: 'Authorization',
      authPrefix: 'Bearer ',
    },
    glm: {
      url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      authHeader: 'Authorization',
      authPrefix: 'Bearer ',
    },
    openai: {
      url: 'https://api.openai.com/v1/chat/completions',
      authHeader: 'Authorization',
      authPrefix: 'Bearer ',
    },
  }

  const providerConfig = providers[provider || 'qwen']
  if (!providerConfig) {
    return jsonResponse({ error: `不支持的AI提供商: ${provider}` }, 400)
  }

  try {
    const aiResponse = await fetch(providerConfig.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [providerConfig.authHeader]: `${providerConfig.authPrefix}${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'qwen-plus',
        messages,
        temperature: body.temperature || 0.7,
        max_tokens: body.max_tokens || 2000,
      }),
    })

    const data = await aiResponse.json()
    return jsonResponse(data, aiResponse.status)
  } catch (error) {
    return jsonResponse({ error: `AI请求失败: ${error.message}` }, 502)
  }
}

// ==================== 健康检查 ====================
function handleHealth() {
  return jsonResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    runtime: 'ESA Edge Function',
  })
}

// ==================== 主路由分发 ====================
async function fetch(request, env) {
  const url = new URL(request.url)
  const path = url.pathname

  // CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // 只处理 /api/ 开头的请求
  if (!path.startsWith('/api/')) {
    return new Response(null, { status: 404 })
  }

  try {
    // 健康检查
    if (path === '/api/health') {
      return handleHealth()
    }

    // 评论
    if (path.startsWith('/api/comments')) {
      return handleComments(request, url, env)
    }

    // 留言板
    if (path.startsWith('/api/guestbook')) {
      return handleGuestbook(request, url, env)
    }

    // 统计
    if (path === '/api/stats' || path === '/api/visits') {
      return handleStats(request, url, env)
    }

    // 友链
    if (path.startsWith('/api/links')) {
      return handleLinks(request, url, env)
    }

    // 设置
    if (path.startsWith('/api/settings')) {
      return handleSettings(request, url, env)
    }

    // AI 代理
    if (path === '/api/ai/chat') {
      return handleAIProxy(request, url)
    }

    return jsonResponse({ error: '接口未找到', path }, 404)
  } catch (error) {
    return jsonResponse({ error: `服务器内部错误: ${error.message}` }, 500)
  }
}

export default { fetch }
