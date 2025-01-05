var messages = document.querySelector('.message-list');
var btn = document.querySelector('.btn');
var input = document.querySelector('input');
var volume = 1;
var expression = 4;
var resetExpression = true;
var crossOrigin = "anonymous";

const sfx = new Audio('/static/kyaa.mp3');
const idleMotion = "w-cool-nodtilthead0102";  
const interactionMotions = ["w-adult-blushed01", "w-cool-sigh01", "w-cool-tilthead0204", "w-adult-delicious01", "w-cool-tilthead03", "w-cute-angry01", "w-adult-glad01", "w-cute-delicious01", "w-cute-fidget01", "w-adult-nod01", "w-cute-forward01", "w-cute-forward03r", "w-adult-posenod02", "w-adult-posetilthead01", "w-adult-posetilthead03", "w-adult-posetrouble02", "w-adult-relief01", "w-adult-shakehand01", "w-adult-shakehead01", "w-adult-think01", "w-adult-think02", "w-adult-tilthead01", "w-adult-tilthead02", "w-cute-glad03", "w-adult-trouble01", "w-cute-glad06r", "w-animal-fidget01", "w-cute-nod02", "w-animal-lookaway01", "w-animal-nod01", "w-animal-nod02", "w-cute-poseforward02", "w-animal-posenod01", "w-animal-shy01", "w-animal-tilthead01", "w-animal-tiltheadnod0101", "w-animalnormal", "w-cool-angry01", "w-cool-forward01","w-cool-forward02", "w-cool-nod01", "w-cute-posenod01", "w-cute-posetilthead04", "w-cool-posenod01", "w-cool-posenod02", "w-cute-posetilthead08", "w-cool-posesad01", "w-cool-posetilthead03", "w-cute-shakehead01", "w-cool-sad01", "w-cute-shy01", "w-cute-sleep01"];  
let motionInterval; 
let model;
let uploadedImageUrl = '';

window.PIXI = PIXI;
const live2d = PIXI.live2d;

document.getElementById('canvas').addEventListener('click', function (event) {
    const x = event.clientX;
    const y = event.clientY;
    
    if (model.hitTest('body', x, y)) {
        model.motion('w-cute-angry01');  
        sfx.volume = 1;  
        sfx.currentTime = 0; 
        sfx.play();
    }
});

function updateTime() {
    const now = new Date();
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}:${seconds}`;
    
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const day = days[now.getDay()];
    const date = String(now.getDate()).padStart(2, '0');
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const currentDate = `${day}, ${date} ${month} ${year}`;
    
    document.getElementById('current-time').textContent = currentTime;
    document.getElementById('current-date').textContent = currentDate;
}

setInterval(updateTime, 1000); 
updateTime(); 

(async function () {
    let canvas_container = document.getElementById('canvas_container');
    const ai = new PIXI.Application({
        view: document.getElementById('canvas'),
        autoStart: true,
        height: canvas_container.offsetHeight,
        width: canvas_container.offsetWidth,
        backgroundAlpha: 0.0
    });

    model = await live2d.Live2DModel.from('static/models/21miku_normal.model3.json', { autoInteract: false });

    ai.stage.addChild(model);

    let scaleX = canvas_container.offsetWidth / model.width;
    let scaleY = canvas_container.offsetHeight / model.height;
    let resize_factor = Math.min(scaleX, scaleY);

    model.x = 0;
    model.y = innerHeight + 100;
    model.rotation = Math.PI;
    model.skew.x = Math.PI;
    model.scale.set(resize_factor);
    model.anchor.set(1, 1);
    model.motion('w-cool-nodtilthead0102');  
})();

function playIdleMotion() {
    model.motion(idleMotion, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46 ,47, 48);  
    startRandomMotion();  
}

function triggerRandomMotion() {
    clearTimeout(motionInterval);  
    const motionName = interactionMotions[Math.floor(Math.random() * interactionMotions.length)];
    model.motion(motionName, 0, 49);  

    motionInterval = setTimeout(triggerRandomMotion, Math.random() * 5000 + 3000);  
}

function triggerInteractionMotion(audio_link) {
    clearTimeout(motionInterval); 

    const motionName = interactionMotions[Math.floor(Math.random() * interactionMotions.length)];
    model.motion(motionName, 0, 49, {
        sound: audio_link,
        volume: volume,
        expression: expression,
        resetExpression: resetExpression
    });

    setTimeout(playIdleMotion, 3000);  
}

function messageInteraction(audio_link, motion = NaN) {
    if (audio_link) {
        let audio = new Audio(audio_link);
        audio.volume = volume;
        audio.crossOrigin = crossOrigin;
        
        audio.play();

        model.speak(audio_link, {
            volume: volume,
            expression: expression,
            resetExpression: resetExpression,
            crossOrigin: crossOrigin
        });

        if (model && !isNaN(motion)) {
            model.motion(motion);
        }
    }
}

btn.addEventListener('click', sendMessage);
input.addEventListener('keyup', function (e) {
    if (e.keyCode == 13) sendMessage();
});

function analyzeEmoji(message) {
    if (message.includes('😊')) {
        model.motion('w-adult-glad01'); 
    } else if (message.includes('😠')) {
        model.motion('w-cool-angry01');  
    } else if (message.includes('😍')) {
        model.motion('w-happy-forward02');
    } else if (message.includes('😭')) {
        model.motion('face_band_cry_01');
    }
}

function loadHistory() {
    messages.innerHTML = '';  

    fetch('/history')
        .then(response => response.json())
        .then(data => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].role == 'user') {
                    writeLine(`<span>User</span><br><br> ${data[i].content}`, 'primary');
                } else {
                    writeLine(`<span>Miku AI</span><br><br> ${data[i].content}`, 'secondary');
                }
            }
        })
        .catch(error => console.error('Error:', error));
}

function sendMessage() {
    var msg = input.value;
    if (!msg && !uploadedImageUrl) return; 

    if (msg) {
        writeLine(`<span>User</span><br><br> ${msg}`, 'primary'); 
        input.value = ''; 
    }
    if (uploadedImageUrl) {
        writeLine(`<span>User</span><br><br><img src="${uploadedImageUrl}" alt="Gambar" style="max-width: 100%; height: auto;">`, 'primary'); 
    }

    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'message': msg || '', 
            'image': uploadedImageUrl || null 
        })
    })
    .then(response => response.json())
    .then(data => {
        addMessage(data, 'secondary'); 
        uploadedImageUrl = ''; 
        analyzeEmoji(msg);
    })
    .catch(error => console.error('Error:', error));
}

function displayUploadedImage(imageUrl) {
    writeLine(`<img src="${imageUrl}" alt="Gambar" style="max-width: 100%; height: auto;">`, 'primary');
}

function uploadImage() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            uploadedImageUrl = event.target.result; 
            displayUploadedImage(uploadedImageUrl); 
            fileInput.value = ''; 
        };
        reader.readAsDataURL(file);
    }
}

function addMessage(msg, typeMessage = 'primary') {
    writeLine(`<span>${msg.FROM}</span><br><br> ${msg.MESSAGE}`, typeMessage);
    if (msg.AUDIO) {
        triggerInteractionMotion(msg.AUDIO); 
    } else {
        triggerRandomMotion();
    }
}

function writeLine(text, typeMessage) {
    var message = document.createElement('li');
    message.classList.add('message-item', 'item-' + typeMessage);
    message.innerHTML = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;  
}

function adjustForMobile() {
    const isMobile = window.innerWidth <= 767;
    
    if (isMobile) {
        model.scale = 0.8;  
    } else {
        model.scale = 1; 
    }
}

if (window.SpeechRecognition || window.webkitSpeechRecognition) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onstart = function () {
        console.log("Voice recognition started");
    };

    recognition.onspeechend = function () {
        console.log("Voice recognition ended");
        recognition.stop();
    };

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        console.log("You said: ", transcript);
        sendMessageWithVoice(transcript); 
    };

    document.getElementById('voiceBtn').addEventListener('click', function() {
        recognition.start();
    });

    recognition.onerror = function(event) {
        console.error("Error occurred in recognition: ", event.error);
    };
} else {
    console.log("Speech recognition not supported in this browser.");
}

function sendMessageWithVoice(transcript) {
    if (!transcript) return;

    writeLine(`<span>User</span><br><br> ${transcript}`, 'primary');

    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'message': transcript })
    })
        .then(response => response.json())
        .then(data => {
            addMessage(data, 'secondary');
            analyzeEmoji(transcript);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

window.addEventListener('resize', adjustForMobile);
window.onload = adjustForMobile;

window.onload = function () {
    loadHistory();
    playIdleMotion();
}
