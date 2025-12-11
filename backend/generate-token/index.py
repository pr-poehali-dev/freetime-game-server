import json
import os
import secrets
import string
from datetime import datetime, timedelta
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Генерирует токен для покупки и сохраняет транзакцию в базе данных
    Args: event - dict с httpMethod, body, headers
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с токеном или ошибкой
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    user_id = body_data.get('user_id')
    product = body_data.get('product')
    stars = body_data.get('stars')
    product_type = body_data.get('product_type', 'item')
    telegram_username = body_data.get('telegram_username')
    
    if not all([user_id, product, stars]):
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Missing required fields: user_id, product, stars'}),
            'isBase64Encoded': False
        }
    
    token = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(12))
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "INSERT INTO transactions (user_id, telegram_username, product_name, product_type, stars_amount, token, status, expires_at) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id, token, expires_at",
                (user_id, telegram_username, product, product_type, stars, token, 'pending', expires_at)
            )
            result = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'transaction_id': result['id'],
                    'token': result['token'],
                    'expires_at': result['expires_at'].isoformat()
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()
