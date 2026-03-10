/**
 * ESA Pages 边缘函数统一入口
 * 使用 Turso (libSQL) HTTP API 实现数据持久化
 *
 * 需要在 ESA 控制台配置环境变量：
 *   TURSO_URL           - Turso 数据库地址（libsql:// 或 https://）
 *   TURSO_AUTH_TOKEN    - Turso 认证令牌（若超100字符限制，可拆分为下面3个）
 *   TURSO_TOKEN_A       - 令牌第1段
 *   TURSO_TOKEN_B       - 令牌第2段
 *   TURSO_TOKEN_C       - 令牌第3段
 */

// ==================== 基础工具 ====================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// ==================== Turso HTTP API ====================

function getTursoHttpUrl(env) {
  const raw = env?.TURSO_URL || ''
  return raw.replace('libsql://', 'https://')
}

/**
 * 获取 Turso 认证令牌（支持单变量或拆分3段拼接）
 */
function getTursoToken(env) {
  if (env?.TURSO_AUTH_TOKEN) return env.TURSO_AUTH_TOKEN
  const a = env?.TURSO_TOKEN_A || ''
  const b = env?.TURSO_TOKEN_B || ''
  const c = env?.TURSO_TOKEN_C || ''
  return (a + b + c) || ''
}

/**
 * 执行单条 SQL 并返回结果
 */
async function dbQuery(env, sql, args) {
  const url = getTursoHttpUrl(env)
  const token = getTursoToken(env)
  if (!url || !token) {
    throw new Error('数据库未配置: 请设置 TURSO_URL 和 TURSO_TOKEN_A/B/C 环境变量')
  }

  const stmtArgs = (args || []).map(a => {
    if (a === null || a === undefined) return { type: 'null' }
    if (typeof a === 'number' && Number.isInteger(a)) return { type: 'integer', value: String(a) }
    if (typeof a === 'number') return { type: 'float', value: String(a) }
    return { type: 'text', value: String(a) }
  })

  const res = await fetch(`${url}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args: stmtArgs } },
        { type: 'close' },
      ],
    }),
  })

  const data = await res.json()

  if (data.results?.[0]?.type === 'ok') {
    const result = data.results[0].response.result
    const cols = result.cols || []
    return {
      rows: (result.rows || []).map(row => {
        const obj = {}
        cols.forEach((col, i) => {
          const cell = row[i]
          if (!cell || cell.type === 'null') { obj[col.name] = null }
          else if (cell.type === 'integer') { obj[col.name] = Number(cell.value) }
          else { obj[col.name] = cell.value }
        })
        return obj
      }),
      rowsAffected: result.affected_row_count || 0,
      lastInsertId: result.last_insert_rowid,
    }
  }

  throw new Error(data.results?.[0]?.error?.message || '数据库查询失败')
}

/**
 * 批量执行多条 SQL（用于建表等操作）
 */
async function dbBatch(env, sqls) {
  const url = getTursoHttpUrl(env)
  const token = getTursoToken(env)
  if (!url || !token) return

  const requests = sqls.map(sql => ({
    type: 'execute',
    stmt: { sql, args: [] },
  }))
  requests.push({ type: 'close' })

  await fetch(`${url}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  })
}

// 数据库初始化状态
let _dbReady = false

async function ensureDB(env) {
  if (_dbReady) return

  // 创建表（IF NOT EXISTS 不会因表已存在而失败）
  await dbBatch(env, [
    `CREATE TABLE IF NOT EXISTS guestbook (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      message TEXT NOT NULL,
      emoji TEXT DEFAULT '😊',
      reply TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id TEXT,
      author TEXT NOT NULL,
      email TEXT,
      content TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      is_approved INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      logo TEXT,
      position INTEGER DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page TEXT NOT NULL,
      ip TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
  ])

  // 为旧表添加可能缺失的列（逐条执行，忽略"列已存在"错误）
  try { await dbQuery(env, "ALTER TABLE guestbook ADD COLUMN emoji TEXT DEFAULT '😊'") } catch {}
  try { await dbQuery(env, 'ALTER TABLE comments ADD COLUMN likes INTEGER DEFAULT 0') } catch {}

  _dbReady = true
}

// ==================== 留言板 ====================

async function handleGuestbook(request, env) {
  await ensureDB(env)

  if (request.method === 'GET') {
    const { rows } = await dbQuery(env,
      'SELECT id, name, message, emoji, created_at FROM guestbook ORDER BY created_at DESC LIMIT 200'
    )
    return jsonResponse(rows.map(r => ({
      id: String(r.id),
      author: r.name,
      content: r.message,
      emoji: r.emoji || '😊',
      createdAt: r.created_at,
    })))
  }

  if (request.method === 'POST') {
    const body = await request.json()
    const name = body.author || '匿名'
    const message = body.content || ''
    const emoji = body.emoji || '😊'
    if (!message.trim()) return jsonResponse({ error: '留言内容不能为空' }, 400)

    const result = await dbQuery(env,
      'INSERT INTO guestbook (name, message, emoji) VALUES (?, ?, ?)',
      [name, message, emoji]
    )
    return jsonResponse({ id: result.lastInsertId }, 201)
  }

  return jsonResponse({ error: '不支持的方法' }, 405)
}

// ==================== 评论 ====================

async function handleComments(request, url, env) {
  await ensureDB(env)
  const parts = url.pathname.split('/').filter(Boolean)

  // GET /api/comments/:postId
  if (request.method === 'GET' && parts.length === 3) {
    const postId = parts[2]
    const { rows } = await dbQuery(env,
      'SELECT id, author, content, likes, created_at FROM comments WHERE post_id = ? ORDER BY created_at DESC',
      [postId]
    )
    return jsonResponse(rows.map(r => ({
      id: String(r.id),
      author: r.author,
      content: r.content,
      likes: r.likes || 0,
      createdAt: r.created_at,
    })))
  }

  // POST /api/comments/:id/like
  if (request.method === 'POST' && parts.length === 4 && parts[3] === 'like') {
    const commentId = parts[2]
    await dbQuery(env,
      'UPDATE comments SET likes = likes + 1 WHERE id = ?',
      [Number(commentId)]
    )
    return jsonResponse({ success: true })
  }

  // POST /api/comments
  if (request.method === 'POST' && parts.length === 2) {
    const body = await request.json()
    const postId = body.postId || ''
    const author = body.author || '匿名'
    const content = body.content || ''
    if (!content.trim()) return jsonResponse({ error: '评论内容不能为空' }, 400)

    const result = await dbQuery(env,
      'INSERT INTO comments (post_id, author, content, likes) VALUES (?, ?, ?, 0)',
      [postId, author, content]
    )
    return jsonResponse({ id: result.lastInsertId }, 201)
  }

  return jsonResponse({ error: '未找到' }, 404)
}

// ==================== 访问统计 ====================

async function handleStats(request, url, env) {
  await ensureDB(env)

  if (url.pathname === '/api/stats' && request.method === 'GET') {
    const { rows: totalRows } = await dbQuery(env, 'SELECT COUNT(*) as cnt FROM visits')
    const today = new Date().toISOString().slice(0, 10)
    const { rows: todayRows } = await dbQuery(env,
      "SELECT COUNT(*) as cnt FROM visits WHERE created_at >= ?", [today]
    )
    return jsonResponse({
      totalVisits: totalRows[0]?.cnt || 0,
      todayVisits: todayRows[0]?.cnt || 0,
    })
  }

  if (url.pathname === '/api/visits' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}))
    const page = body.page || '/'
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || ''
    const ua = request.headers.get('user-agent') || ''
    await dbQuery(env,
      'INSERT INTO visits (page, ip, user_agent) VALUES (?, ?, ?)',
      [page, ip, ua]
    )
    return jsonResponse({ success: true })
  }

  return jsonResponse({ error: '未找到' }, 404)
}

// ==================== 友链 ====================

async function handleLinks(request, url, env) {
  await ensureDB(env)
  const parts = url.pathname.split('/').filter(Boolean)

  if (request.method === 'GET') {
    const { rows } = await dbQuery(env,
      'SELECT id, name, url, description, logo FROM links ORDER BY position ASC, id ASC'
    )
    return jsonResponse(rows)
  }

  if (request.method === 'POST') {
    const body = await request.json()
    const result = await dbQuery(env,
      'INSERT INTO links (name, url, description, logo) VALUES (?, ?, ?, ?)',
      [body.name || '', body.url || '', body.description || '', body.logo || '']
    )
    return jsonResponse({ id: result.lastInsertId }, 201)
  }

  if (request.method === 'DELETE' && parts.length === 3) {
    const id = Number(parts[2])
    await dbQuery(env, 'DELETE FROM links WHERE id = ?', [id])
    return jsonResponse({ success: true })
  }

  return jsonResponse({ error: '未找到' }, 404)
}

// ==================== 设置 ====================

async function handleSettings(request, url, env) {
  await ensureDB(env)
  const parts = url.pathname.split('/').filter(Boolean)
  const key = parts[2]
  if (!key) return jsonResponse({ error: '缺少设置键名' }, 400)

  if (request.method === 'GET') {
    const { rows } = await dbQuery(env,
      'SELECT value FROM settings WHERE key = ?', [key]
    )
    return jsonResponse({ value: rows[0]?.value || null })
  }

  if (request.method === 'PUT') {
    const body = await request.json()
    await dbQuery(env,
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, body.value || '']
    )
    return jsonResponse({ success: true })
  }

  return jsonResponse({ error: '未找到' }, 404)
}

// ==================== AI 代理 ====================

async function handleAIProxy(request) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: '仅支持POST请求' }, 405)
  }

  const body = await request.json()
  const { provider, apiKey, model, messages } = body

  if (!apiKey || !messages) {
    return jsonResponse({ error: '缺少必要参数: apiKey, messages' }, 400)
  }

  const providers = {
    qwen: { url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions' },
    deepseek: { url: 'https://api.deepseek.com/v1/chat/completions' },
    kimi: { url: 'https://api.moonshot.cn/v1/chat/completions' },
    glm: { url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions' },
    openai: { url: 'https://api.openai.com/v1/chat/completions' },
    anthropic: { url: 'https://api.anthropic.com/v1/messages' },
    google: { url: 'https://generativelanguage.googleapis.com/v1beta/models/' + (model || 'gemini-2.0-flash-exp') + ':generateContent' },
  }

  const cfg = providers[provider || 'qwen']
  if (!cfg) return jsonResponse({ error: `不支持的AI提供商: ${provider}` }, 400)

  try {
    const aiRes = await fetch(cfg.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'qwen-plus',
        messages,
        temperature: body.temperature || 0.7,
        max_tokens: body.max_tokens || 2000,
      }),
    })
    const data = await aiRes.json()
    return jsonResponse(data, aiRes.status)
  } catch (error) {
    return jsonResponse({ error: `AI请求失败: ${error.message}` }, 502)
  }
}

// ==================== 健康检查 ====================

async function handleHealth(env) {
  let dbStatus = '未配置'
  const tursoUrl = getTursoHttpUrl(env)
  if (tursoUrl && getTursoToken(env)) {
    try {
      await dbQuery(env, 'SELECT 1 as ok')
      dbStatus = '已连接'
    } catch (e) {
      dbStatus = `连接失败: ${e.message}`
    }
  }

  return jsonResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    runtime: 'ESA Edge Function',
    database: dbStatus,
  })
}

// ==================== 主路由 ====================

async function handleRequest(request, env) {
  const url = new URL(request.url)
  const path = url.pathname

  // CORS 预检
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // 仅处理 /api/ 开头的请求，其余交给静态资源服务
  if (!path.startsWith('/api/')) {
    return new Response(null, { status: 404 })
  }

  try {
    if (path === '/api/health') return await handleHealth(env)
    if (path.startsWith('/api/guestbook')) return await handleGuestbook(request, env)
    if (path.startsWith('/api/comments')) return await handleComments(request, url, env)
    if (path === '/api/stats' || path === '/api/visits') return await handleStats(request, url, env)
    if (path.startsWith('/api/links')) return await handleLinks(request, url, env)
    if (path.startsWith('/api/settings')) return await handleSettings(request, url, env)
    if (path === '/api/ai/chat') return await handleAIProxy(request)
    return jsonResponse({ error: '接口未找到', path }, 404)
  } catch (error) {
    return jsonResponse({ error: `服务器错误: ${error.message}` }, 500)
  }
}

export default { fetch: handleRequest }
