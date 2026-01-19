import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { db, initDatabase } from './db';
import 'dotenv/config';

const app = new Hono();

// 中间件
app.use('*', cors());
app.use('*', logger());

// 健康检查（用于 cron-job 唤醒）
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ==================== 文章 API ====================
app.get('/api/posts', async (c) => {
    const result = await db.execute('SELECT * FROM posts WHERE is_published = 1 ORDER BY is_pinned DESC, created_at DESC');
    return c.json(result.rows);
});

app.get('/api/posts/:id', async (c) => {
    const id = c.req.param('id');
    // 增加浏览量
    await db.execute({ sql: 'UPDATE posts SET views = views + 1 WHERE id = ?', args: [id] });
    const result = await db.execute({ sql: 'SELECT * FROM posts WHERE id = ?', args: [id] });
    return c.json(result.rows[0] || null);
});

app.post('/api/posts', async (c) => {
    const body = await c.req.json();
    const { title, content, category, tags, cover_image } = body;
    const result = await db.execute({
        sql: 'INSERT INTO posts (title, content, category, tags, cover_image) VALUES (?, ?, ?, ?, ?)',
        args: [title, content, category, JSON.stringify(tags), cover_image],
    });
    return c.json({ id: result.lastInsertRowid });
});

app.put('/api/posts/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { title, content, category, tags, cover_image, is_published, is_pinned } = body;
    await db.execute({
        sql: 'UPDATE posts SET title = ?, content = ?, category = ?, tags = ?, cover_image = ?, is_published = ?, is_pinned = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        args: [title, content, category, JSON.stringify(tags), cover_image, is_published ? 1 : 0, is_pinned ? 1 : 0, id],
    });
    return c.json({ success: true });
});

app.delete('/api/posts/:id', async (c) => {
    const id = c.req.param('id');
    await db.execute({ sql: 'DELETE FROM posts WHERE id = ?', args: [id] });
    return c.json({ success: true });
});

app.post('/api/posts/:id/like', async (c) => {
    const id = c.req.param('id');
    await db.execute({ sql: 'UPDATE posts SET likes = likes + 1 WHERE id = ?', args: [id] });
    return c.json({ success: true });
});

// ==================== 手记 API ====================
app.get('/api/notes', async (c) => {
    const result = await db.execute('SELECT * FROM notes ORDER BY created_at DESC');
    return c.json(result.rows);
});

app.post('/api/notes', async (c) => {
    const body = await c.req.json();
    const { title, content, tags } = body;
    const result = await db.execute({
        sql: 'INSERT INTO notes (title, content, tags) VALUES (?, ?, ?)',
        args: [title, content, JSON.stringify(tags)],
    });
    return c.json({ id: result.lastInsertRowid });
});

app.delete('/api/notes/:id', async (c) => {
    const id = c.req.param('id');
    await db.execute({ sql: 'DELETE FROM notes WHERE id = ?', args: [id] });
    return c.json({ success: true });
});

app.post('/api/notes/:id/like', async (c) => {
    const id = c.req.param('id');
    await db.execute({ sql: 'UPDATE notes SET likes = likes + 1 WHERE id = ?', args: [id] });
    return c.json({ success: true });
});

// ==================== 评论 API ====================
// 通用评论端点（用于前端 CommentSection）
app.get('/api/comments/:postId', async (c) => {
    const postId = c.req.param('postId');
    const result = await db.execute({
        sql: 'SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC',
        args: [postId],
    });
    return c.json(result.rows);
});

app.post('/api/comments', async (c) => {
    const body = await c.req.json();
    const { postId, author, content, parentId } = body;
    const result = await db.execute({
        sql: 'INSERT INTO comments (post_id, author, email, content) VALUES (?, ?, ?, ?)',
        args: [postId, author, '', content],
    });
    return c.json({ id: result.lastInsertRowid });
});

app.post('/api/comments/:id/like', async (c) => {
    const id = c.req.param('id');
    // 假设comments表有likes字段 
    return c.json({ success: true });
});

app.get('/api/posts/:postId/comments', async (c) => {
    const postId = c.req.param('postId');
    const result = await db.execute({
        sql: 'SELECT * FROM comments WHERE post_id = ? AND is_approved = 1 ORDER BY created_at DESC',
        args: [postId],
    });
    return c.json(result.rows);
});

app.post('/api/posts/:postId/comments', async (c) => {
    const postId = c.req.param('postId');
    const body = await c.req.json();
    const { author, email, content } = body;
    const result = await db.execute({
        sql: 'INSERT INTO comments (post_id, author, email, content) VALUES (?, ?, ?, ?)',
        args: [postId, author, email, content],
    });
    return c.json({ id: result.lastInsertRowid });
});

// ==================== 留言板 API ====================
app.get('/api/guestbook', async (c) => {
    const result = await db.execute('SELECT * FROM guestbook ORDER BY created_at DESC');
    return c.json(result.rows);
});

app.post('/api/guestbook', async (c) => {
    const body = await c.req.json();
    const { author, content, emoji } = body;
    const result = await db.execute({
        sql: 'INSERT INTO guestbook (name, email, message) VALUES (?, ?, ?)',
        args: [author, emoji || '😊', content],
    });
    return c.json({ id: result.lastInsertRowid });
});

// ==================== 友链 API ====================
app.get('/api/links', async (c) => {
    const result = await db.execute('SELECT * FROM links ORDER BY position ASC');
    return c.json(result.rows);
});

app.post('/api/links', async (c) => {
    const body = await c.req.json();
    const { name, url, description, logo } = body;
    const result = await db.execute({
        sql: 'INSERT INTO links (name, url, description, logo) VALUES (?, ?, ?, ?)',
        args: [name, url, description, logo],
    });
    return c.json({ id: result.lastInsertRowid });
});

app.delete('/api/links/:id', async (c) => {
    const id = c.req.param('id');
    await db.execute({ sql: 'DELETE FROM links WHERE id = ?', args: [id] });
    return c.json({ success: true });
});

// ==================== 访问统计 API ====================
app.post('/api/visits', async (c) => {
    const body = await c.req.json();
    const { page } = body;
    const ip = c.req.header('x-forwarded-for') || 'unknown';
    const userAgent = c.req.header('user-agent') || '';
    await db.execute({
        sql: 'INSERT INTO visits (page, ip, user_agent) VALUES (?, ?, ?)',
        args: [page, ip, userAgent],
    });
    return c.json({ success: true });
});

app.get('/api/stats', async (c) => {
    const totalResult = await db.execute('SELECT COUNT(*) as count FROM visits');
    const todayResult = await db.execute(
        "SELECT COUNT(*) as count FROM visits WHERE date(created_at) = date('now')"
    );
    const postsResult = await db.execute('SELECT COUNT(*) as count FROM posts WHERE is_published = 1');
    const notesResult = await db.execute('SELECT COUNT(*) as count FROM notes');

    return c.json({
        totalVisits: totalResult.rows[0]?.count || 0,
        todayVisits: todayResult.rows[0]?.count || 0,
        postsCount: postsResult.rows[0]?.count || 0,
        notesCount: notesResult.rows[0]?.count || 0,
    });
});

// ==================== 设置 API ====================
app.get('/api/settings/:key', async (c) => {
    const key = c.req.param('key');
    const result = await db.execute({ sql: 'SELECT value FROM settings WHERE key = ?', args: [key] });
    return c.json({ value: result.rows[0]?.value || null });
});

app.put('/api/settings/:key', async (c) => {
    const key = c.req.param('key');
    const body = await c.req.json();
    const { value } = body;
    await db.execute({
        sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        args: [key, value],
    });
    return c.json({ success: true });
});

// 启动服务器
const port = parseInt(process.env.PORT || '3000');

// 初始化数据库后启动
initDatabase().then(() => {
    console.log(`🚀 服务器运行在 http://localhost:${port}`);
});

export default {
    port,
    fetch: app.fetch,
};
