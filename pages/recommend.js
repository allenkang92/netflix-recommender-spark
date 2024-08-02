const API_BASE_URL = 'http://localhost:8000';
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

function resetGenreSelections() {
    positiveGenres = [];
    negativeGenres = [];
    genres.forEach(genre => {
        document.getElementById(`${genre}-positive-btn`).classList.remove('positive');
        document.getElementById(`${genre}-negative-btn`).classList.remove('negative');
    });
}

async function getRecommendations(positiveGenres, negativeGenres) {
    try {
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
        return await response.json();
    } catch (error) {
        console.error("Could not fetch recommendations:", error);
        throw error;
    }
}

function displayMovies(movies) {
    const container = d3.select("#recommendation-container");
    container.selectAll("*").remove();

    movies.forEach((movie, index) => {
        const svg = container.append("svg")
            .attr("viewBox", "0 0 800 400")
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%")
            .style("height", "auto")
            .style("margin-bottom", "20px");

        svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "#141414");

        svg.append("text")
            .attr("x", 20)
            .attr("y", 40)
            .attr("fill", "#ffffff")
            .attr("font-size", 24)
            .text(movie.title);

        svg.append("text")
            .attr("x", 20)
            .attr("y", 70)
            .attr("fill", "#cccccc")
            .attr("font-size", 16)
            .text(`Rating: ${movie.rating} | IMDB Score: ${movie.imdb_score}`);

        svg.append("text")
            .attr("x", 20)
            .attr("y", 100)
            .attr("fill", "#cccccc")
            .attr("font-size", 14)
            .text(`Genres: ${movie.genres.join(', ')}`);

        const button = svg.append("g")
            .attr("transform", "translate(650, 360)")
            .style("cursor", "pointer");

        button.append("rect")
            .attr("width", 130)
            .attr("height", 30)
            .attr("rx", 15)
            .attr("fill", "#e50914");

        button.append("text")
            .attr("x", 65)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("fill", "#ffffff")
            .text("More Info");
    });
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
        resetGenreSelections();
    });

    confirmBtn.addEventListener('click', async () => {
        if (positiveGenres.length === 0 && negativeGenres.length === 0) {
            showError("Please select at least one genre preference.");
            return;
        }

        try {
            showLoading();
            const recommendedMovies = await getRecommendations(positiveGenres, negativeGenres);
            displayMovies(recommendedMovies);
            modal.style.display = 'none';
            resetGenreSelections();
        } catch (error) {
            showError(error.message);
        } finally {
            hideLoading();
        }
    });

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

function showLoading() {
    const loadingElement = document.createElement('div');
    loadingElement.id = 'loading';
    loadingElement.textContent = 'Loading recommendations...';
    document.body.appendChild(loadingElement);
}

function hideLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.remove();
    }
}

function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.id = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = 'red';
    errorElement.style.marginTop = '10px';
    document.getElementById('recommendation-container').appendChild(errorElement);
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}
