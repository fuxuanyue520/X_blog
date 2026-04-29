-- 为 admin_sessions 表添加 last_activity_at 字段
ALTER TABLE admin_sessions 
ADD COLUMN last_activity_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
AFTER expires_at;

-- 更新现有会话的最后活动时间
UPDATE admin_sessions 
SET last_activity_at = created_at 
WHERE last_activity_at IS NULL;
