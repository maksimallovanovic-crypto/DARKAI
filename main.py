from flask import Flask, send_from_directory
import os

app = Flask(__name__, static_folder='static')

# Главная страница
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

# Обслуживание статики: CSS, JS, и т.д.
@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# API для чата (пример)
@app.route('/api/ping')
def ping():
    return {"status": "ok", "message": "DARK AI жив"}

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
