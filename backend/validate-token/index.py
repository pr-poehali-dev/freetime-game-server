import json
import os
from datetime import datetime
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Валидирует токен и активирует покупку
    Args: event - dict с httpMethod, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с результатом валидации
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters', {})
    token = params.get('token')
    minecraft_nick = params.get('minecraft_nick')
    
    if not token:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Token is required'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM transactions WHERE token = %s",
                (token,)
            )
            transaction = cur.fetchone()
            
            if not transaction:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Token not found', 'valid': False}),
                    'isBase64Encoded': False
                }
            
            if transaction['status'] == 'activated':
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Token already used', 'valid': False}),
                    'isBase64Encoded': False
                }
            
            if transaction['expires_at'] and transaction['expires_at'] < datetime.utcnow():
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Token expired', 'valid': False}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "UPDATE transactions SET status = %s, activated_at = %s, minecraft_nick = %s WHERE token = %s",
                ('activated', datetime.utcnow(), minecraft_nick, token)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'valid': True,
                    'product_name': transaction['product_name'],
                    'product_type': transaction['product_type'],
                    'stars_amount': transaction['stars_amount'],
                    'message': 'Token activated successfully'
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()
