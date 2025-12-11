CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    telegram_username TEXT,
    product_name TEXT NOT NULL,
    product_type TEXT NOT NULL,
    stars_amount INTEGER NOT NULL,
    token TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    minecraft_nick TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP,
    activated_at TIMESTAMP,
    notes TEXT
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_token ON transactions(token);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    telegram_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO admin_users (telegram_id, username, role) 
VALUES ('InfernoClient', 'InfernoClient', 'super_admin') 
ON CONFLICT (telegram_id) DO NOTHING;