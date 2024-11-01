const API_BASE_URL = 'http://54.180.227.56:8282';
async function fetchTop20Movies() {
        const response = await fetch(`${API_BASE_URL}/top20`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json()
}

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

async function displayTop20Movies() {
    const movies = await fetchTop20Movies();
    const totalHeight = movies.length * 280; // 각 영화 카드의 높이 * 영화 수

    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="${totalHeight}" viewBox="0 0 800 ${totalHeight}">
        ${movies.map((movie, index) => createMovieSVG(movie, index)).join('')}
    </svg>
    `;

    document.getElementById('movie-list').innerHTML = svgContent;
}

// 페이지 로드 시 실행
window.onload = displayTop20Movies;