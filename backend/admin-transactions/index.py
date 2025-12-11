import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Получает список всех транзакций для админ-панели
    Args: event - dict с httpMethod, queryStringParameters, headers
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response со списком транзакций
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    admin_token = headers.get('x-admin-token') or headers.get('X-Admin-Token')
    
    if not admin_token or admin_token != os.environ.get('ADMIN_SECRET_TOKEN', 'admin123'):
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        status_filter = params.get('status')
        limit = int(params.get('limit', 100))
        offset = int(params.get('offset', 0))
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if status_filter:
                    cur.execute(
                        "SELECT * FROM transactions WHERE status = %s ORDER BY created_at DESC LIMIT %s OFFSET %s",
                        (status_filter, limit, offset)
                    )
                else:
                    cur.execute(
                        "SELECT * FROM transactions ORDER BY created_at DESC LIMIT %s OFFSET %s",
                        (limit, offset)
                    )
                
                transactions = cur.fetchall()
                
                cur.execute("SELECT COUNT(*) as total FROM transactions")
                total = cur.fetchone()['total']
                
                result = []
                for t in transactions:
                    result.append({
                        'id': t['id'],
                        'user_id': t['user_id'],
                        'telegram_username': t['telegram_username'],
                        'product_name': t['product_name'],
                        'product_type': t['product_type'],
                        'stars_amount': t['stars_amount'],
                        'token': t['token'],
                        'status': t['status'],
                        'minecraft_nick': t['minecraft_nick'],
                        'created_at': t['created_at'].isoformat() if t['created_at'] else None,
                        'expires_at': t['expires_at'].isoformat() if t['expires_at'] else None,
                        'activated_at': t['activated_at'].isoformat() if t['activated_at'] else None,
                        'notes': t['notes']
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'transactions': result,
                        'total': total,
                        'limit': limit,
                        'offset': offset
                    }),
                    'isBase64Encoded': False
                }
        finally:
            conn.close()
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        transaction_id = body_data.get('transaction_id')
        action = body_data.get('action')
        notes = body_data.get('notes')
        
        if not transaction_id or not action:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing transaction_id or action'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if action == 'update_status':
                    new_status = body_data.get('status')
                    cur.execute(
                        "UPDATE transactions SET status = %s, notes = %s WHERE id = %s",
                        (new_status, notes, transaction_id)
                    )
                elif action == 'add_note':
                    cur.execute(
                        "UPDATE transactions SET notes = %s WHERE id = %s",
                        (notes, transaction_id)
                    )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'message': 'Transaction updated'}),
                    'isBase64Encoded': False
                }
        finally:
            conn.close()
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
