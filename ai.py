from flask import Flask, render_template, request, jsonify
import sqlite3
from openai import OpenAI
import markdown2
import edge_tts
from io import BytesIO
from pydub import AudioSegment
from PIL import Image
import torch 
from torchvision import models, transforms
from torchvision.models import resnet18, ResNet18_Weights
import os
import time

conn = sqlite3.connect('chat_messages.db', check_same_thread=False)
c = conn.cursor()

c.execute('''CREATE TABLE IF NOT EXISTS messages(role TEXT, content TEXT)''')
conn.commit()

async def synth_audio_edge(text, temp_file):
    VOICE = "en-US-JennyNeural"  # Ganti suara jika diperlukan
    communicate = edge_tts.Communicate(text, VOICE, rate="+10%")
    byte_array = bytearray()

    try:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                byte_array.extend(chunk["data"])
        audio_data = BytesIO(byte_array)
        audio_segment = AudioSegment.from_file(audio_data)
        audio_segment.export(temp_file, format="wav")
    except Exception as e:
        print(f"Error in synth_audio_edge: {e}")
        return None
    return temp_file

async def synthesize(text, filename):
    for file in os.listdir("./static/audio"):
        os.remove("./static/audio/" + file)

    timestamp = time.strftime("%Y%m%d-%H%M%S")
    temp_file = f"./static/audio/{filename}-{timestamp}.wav"
    path_out = await synth_audio_edge(text, temp_file)

    return path_out

system_prompt = "Hatsune Miku. You are an AI assistant from the anime world."

def getAnswer(role, text):
    c.execute("INSERT INTO messages VALUES (?, ?)", (role, text))
    conn.commit()

    c.execute("SELECT * FROM messages ORDER BY rowid DESC LIMIT 5")
    previous_messages = [{"role": row[0], "content": row[1]} for row in c.fetchall()]
    previous_messages = list(reversed(previous_messages))

    if "system" not in [x["role"] for x in previous_messages]:
        previous_messages = [{"role": "system", "content": system_prompt}] + previous_messages

    client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
    response = client.chat.completions.create(
        model="llama3",
        messages=previous_messages,
        temperature=0.7,
    )

    bot_response = response.choices[0].message.content.strip()

    c.execute("INSERT INTO messages VALUES (?, ?)", ("assistant", bot_response))
    conn.commit()

    return bot_response

ai = Flask(__name__)

weights = ResNet18_Weights.IMAGENET1K_V1
model = resnet18(weights=weights)
model.eval()

preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

@ai.route('/process-image', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    
    try:
        img = Image.open(file.stream)
        print(f"Image mode: {img.mode}, size: {img.size}")
        img_t = preprocess(img)
        print(f"Tensor shape: {img_t.shape}")
        batch_t = torch.unsqueeze(img_t, 0)

        with torch.no_grad():
            out = model(batch_t)
        
        # Process the model output (e.g., get the predicted class)
        _, predicted = torch.max(out, 1)
        return jsonify({'predicted_class': predicted.item()})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai.route('/')
def index():
    c.execute("DELETE FROM messages")
    conn.commit()

    return render_template('index.html')

@ai.route('/chat', methods=['POST'])
async def chat():
    data = request.json
    user_message = data['message']

    bot_response = getAnswer("User", user_message)

    audio_file_path = await synthesize(bot_response, "response_audio")

    return jsonify({
        'FROM': 'Miku AI',
        'MESSAGE': markdown2.markdown(bot_response),
        'AUDIO': audio_file_path  # Mengirimkan path audio file
    })

def ai_endpoint():
    data = request.get_json()
    response = {"reply": f"Received: {data['message']}"}
    return jsonify(response)

@ai.route('/history', methods=['GET'])
def history():
    c.execute("SELECT * FROM messages order by rowid")
    previous_messsages = [{"role": row[0], "content": markdown2.markdown(row[1])} for row in c.fetchall()]
    return jsonify(previous_messsages)

if __name__ == '__main__':
    ai.run(debug=True)
