document.addEventListener('DOMContentLoaded', () => {
    const getRecommendationBtn = document.querySelector('.btn-open-modal');
    const confirmBtn = document.querySelector('.btn-confirm');
    const closeModalBtn = document.querySelector('.btn-close-modal');
    const modal = document.querySelector('.modal');

    getRecommendationBtn.addEventListener('click', openModal);
    confirmBtn.addEventListener('click', handleConfirm);
    closeModalBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    initializeGenreButtons();
});

document.querySelector('.modal').style.display = 'flex';

function openModal() {
    const modal = document.querySelector('.modal');
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.querySelector('.modal');
    modal.style.display = 'none';
    resetGenreSelections();
}

function handleConfirm() {
    sendSelectedGenres();
    closeModal();
}

function showLoading() {
    const container = document.getElementById('recommendation-container');
    container.innerHTML = '<p>Loading recommendation...</p>';
}

function showError(message) {
    const container = document.getElementById('recommendation-container');
    container.innerHTML = `<p>Error: ${message}</p>`;
}