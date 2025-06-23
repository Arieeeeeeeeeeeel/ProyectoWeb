import hmac
import hashlib
import requests
from flask import Blueprint, request, jsonify, redirect

bp = Blueprint('flow', __name__)

API_KEY = '1F1FC47B-A0AE-4799-9CCA-637AF6L5EFC5'
SECRET_KEY = '002ff58e8a268c529cb2ba589ce53f5149ec4b2b'
FLOW_API_URL = 'https://sandbox.flow.cl/api'


def sign_params(params: dict, secret_key: str) -> str:
    keys = sorted(params.keys())
    to_sign = ''.join(f'{k}{params[k]}' for k in keys)
    return hmac.new(secret_key.encode(), to_sign.encode(), hashlib.sha256).hexdigest()

@bp.route('/flow/create-payment', methods=['POST'])
def create_payment():
    data = request.json
    params = {
        'apiKey': API_KEY,
        'subject': data['subject'],
        'currency': data['currency'],
        'amount': data['amount'],
        'email': data['email'],
        'urlReturn': data['urlReturn'],
        'urlConfirmation': data['urlConfirmation'],
        'commerceOrder': data['commerceOrder'],  # <--- nuevo campo obligatorio
    }
    if 'optional' in data:
        params['optional'] = data['optional']
    params['s'] = sign_params(params, SECRET_KEY)
    print('PARAMS ENVIADOS A FLOW:', params, flush=True)
    response = requests.post(f'{FLOW_API_URL}/payment/create', data=params)
    print('RESPUESTA FLOW:', response.status_code, response.text, flush=True)
    return jsonify(response.json()), response.status_code

@bp.route('/flow/payment-status', methods=['GET'])
def payment_status():
    token = request.args.get('token')
    params = {
        'apiKey': API_KEY,
        'token': token
    }
    params['s'] = sign_params(params, SECRET_KEY)
    response = requests.get(f'{FLOW_API_URL}/payment/getStatus', params=params)
    return jsonify(response.json()), response.status_code

@bp.route('/flow/retorno', methods=['GET', 'POST'])
def flow_retorno():
    token = request.values.get('token')
    return redirect(f'http://localhost:8100/pago-exitoso?token={token}')
