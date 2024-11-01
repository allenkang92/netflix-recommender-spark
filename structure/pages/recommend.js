const API_BASE_URL = 'http://54.180.227.56:8282';
const OLLAMA_URL = 'http://43.203.223.48:5000';

const genres = ['action', 'animation', 'comedy', 'crime', 'documentation', 'drama', 'european', 'family', 'fantasy', 'history', 'horror', 'music', 'reality', 'romance', 'scifi', 'sport', 'thriller', 'war', 'western'];
let positiveGenres = [];
let negativeGenres = [];

// Ollama 챗봇 기능
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

async function sendMessage() {
    const message = userInput.value;
    if (!message) return; // 메시지가 없으면 아무것도 하지 않음

    addMessage(message, "user");

    try {
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ model: "llama3", prompt: message })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        addMessage(data.response, "bot");
    } catch (error) {
        console.error('Error:', error);
        addMessage("Error: Could not get response from Ollama", "bot");
    }

    userInput.value = ''; // 입력 필드 비우기
}

function addMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = sender + '-message';
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function initializeGenreButtons() {
    createGenreButtons('positive-buttons', positiveGenres, 'positive');
    createGenreButtons('negative-buttons', negativeGenres, 'negative');
}

function createGenreButtons(containerId, genreArray, className) {
    const container = document.getElementById(containerId);
    genres.forEach(genre => {
        const button = document.createElement('button');
        button.textContent = genre;
        button.id = `${genre}-${className}-btn`;
        button.addEventListener('click', () => toggleGenre(genre, genreArray, className));
        container.appendChild(button);
    });
}

function toggleGenre(genre, genreArray, className) {
    const index = genreArray.indexOf(genre);
    const button = document.getElementById(`${genre}-${className}-btn`);
    if (index === -1) {
        genreArray.push(genre);
        button.classList.add(className);
    } else {
        genreArray.splice(index, 1);
        button.classList.remove(className);
    }
    console.log(`${className} genres:`, genreArray);
}

async function getRecommendations(positiveGenres, negativeGenres) {
        const response = await fetch(`${API_BASE_URL}/recommend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ positive: positiveGenres, negative: negativeGenres })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
}

document.addEventListener('DOMContentLoaded', () => {
    initializeGenreButtons();

    const modal = document.querySelector('.modal');
    const openModalBtn = document.querySelector('.btn-open-modal');
    const closeModalBtn = document.querySelector('.btn-close-modal');
    const confirmBtn = document.querySelector('.btn-confirm');

    openModalBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    confirmBtn.addEventListener('click', async () => {
        if (positiveGenres.length === 0 && negativeGenres.length === 0) {
            return;
        }

        modal.style.display = 'none';
        await displayTop20Movies(positiveGenres, negativeGenres)
        // const recommendedMovies = await getRecommendations(positiveGenres, negativeGenres);
        // displayMovies(recommendedMovies);
    });

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

function createMovieSVG(movie, index) {
    const yOffset = index * 280; // 각 영화 카드의 높이 + 간격

    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400" y="${yOffset}">
        <rect width="100%" height="100%" fill="#141414"/>
        
        <!-- Movie Title -->
        <text x="20" y="40" font-family="Arial" font-size="30" fill="#ffffff">${movie.title}</text>
        
        <!-- Rating and Runtime -->
        <text x="20" y="70" font-family="Arial" font-size="16" fill="#cccccc">Rating: ${movie.rating}</text>
        
        <!-- IMDB Score -->
        <rect x="20" y="85" width="50" height="25" rx="5" fill="#f5c518"/>
        <text x="45" y="103" font-family="Arial" font-size="14" fill="#000000" text-anchor="middle">${movie.imdb_score}</text>
        
        <!-- Genres -->
        <text x="80" y="103" font-family="Arial" font-size="14" fill="#cccccc">${movie.genres.join(', ')}</text>
        
        <!-- Description -->
        <rect x="20" y="120" width="760" height="80" rx="5" fill="#2a2a2a"/>
        <text x="30" y="140" font-family="Arial" font-size="14" fill="#ffffff">
            ${wrapText(movie.description, 70).map((line, i) => `<tspan x="30" dy="${i === 0 ? 0 : 20}">${line}</tspan>`).join('')}
        </text>
        
        <!-- Director and Cast -->
        <text x="20" y="230" font-family="Arial" font-size="16" fill="#ffffff">Director: ${movie.director}</text>
        <text x="20" y="255" font-family="Arial" font-size="14" fill="#cccccc">Cast: ${movie.cast}</text>
    </svg>
    `;
}

// 텍스트 줄바꿈 함수
function wrapText(text, maxLength) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        if ((currentLine + word).length <= maxLength) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}

async function displayTop20Movies(positiveGenres, negativeGenres) {
    const movies = await getRecommendations(positiveGenres, negativeGenres);
    console.log(movies)
    const totalHeight = movies.length * 280; // 각 영화 카드의 높이 * 영화 수

    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="${totalHeight}" viewBox="0 0 800 ${totalHeight}">
        ${movies.map((movie, index) => createMovieSVG(movie, index)).join('')}
    </svg>
    `;

    document.getElementById('movie-recommendations').innerHTML = svgContent;
}
