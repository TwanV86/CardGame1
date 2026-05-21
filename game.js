// ===== CARD DEFINITIONS =====
const SUITS = {
    hearts: '♥',
    diamonds: '◇',
    clubs: '♣',
    spades: '♠'
};

const SUIT_COLORS = {
    hearts: '#c41e3a',
    diamonds: '#2d5016',
    clubs: '#1a1a1a',
    spades: '#000000'
};

// ===== GAME STATE =====
let gameState = {
    difficulty: 'easy',
    totalRounds: 3,
    currentRound: 1,
    playerScore: 0,
    aiScore: 0,
    playerCards: [],
    aiCards: [],
    deck: [],
    discard: [],
    gameHistory: [],
    currentPlayerRoundScore: 0,
    currentAiRoundScore: 0,
    isPlayerTurn: true,
    gameActive: false
};

// ===== INITIALIZATION =====
window.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }
    
    const nextRoundBtn = document.getElementById('nextRoundBtn');
    if (nextRoundBtn) {
        nextRoundBtn.addEventListener('click', nextRound);
    }
    
    const backToMenuBtn = document.getElementById('backToMenuBtn');
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', backToMenu);
    }
    
    const endGameBtn = document.getElementById('endGameBtn');
    if (endGameBtn) {
        endGameBtn.addEventListener('click', confirmEndGame);
    }
    
    const toggleHistory = document.getElementById('toggleHistory');
    if (toggleHistory) {
        toggleHistory.addEventListener('click', toggleHistoryClick);
    }
    
    const drawFromDeck = document.getElementById('drawFromDeck');
    if (drawFromDeck) {
        drawFromDeck.addEventListener('click', drawFromDeck);
    }
    
    const drawFromDiscard = document.getElementById('drawFromDiscard');
    if (drawFromDiscard) {
        drawFromDiscard.addEventListener('click', drawFromDiscardFn);
    }
    
    const knockBtn = document.getElementById('knockBtn');
    if (knockBtn) {
        knockBtn.addEventListener('click', playerKnock);
    }
});

// ===== GAME FLOW =====
function startGame() {
    gameState.difficulty = document.getElementById('difficulty').value;
    gameState.totalRounds = parseInt(document.getElementById('rounds').value);
    gameState.currentRound = 1;
    gameState.playerScore = 0;
    gameState.aiScore = 0;
    gameState.gameHistory = [];
    
    document.getElementById('difficultyDisplay').textContent = 
        gameState.difficulty === 'easy' ? '👶 Kind' : '🧙 Volwassene';
    
    initializeRound();
    showScreen('gameScreen');
}

function initializeRound() {
    gameState.deck = createDeck();
    gameState.discard = [];
    gameState.playerCards = [];
    gameState.aiCards = [];
    
    for (let i = 0; i < 3; i++) {
        gameState.playerCards.push(gameState.deck.pop());
        gameState.aiCards.push(gameState.deck.pop());
    }
    
    gameState.discard.push(gameState.deck.pop());
    
    gameState.isPlayerTurn = true;
    gameState.gameActive = true;
    gameState.currentPlayerRoundScore = calculateScore(gameState.playerCards);
    gameState.currentAiRoundScore = calculateScore(gameState.aiCards);
    
    updateUI();
}

function createDeck() {
    const deck = [];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    
    for (let deckNum = 0; deckNum < 2; deckNum++) {
        for (const suit of suits) {
            for (let num = 2; num <= 10; num++) {
                deck.push({ suit, value: num, display: num });
            }
            deck.push({ suit, value: 10, display: 'J' });
            deck.push({ suit, value: 10, display: 'Q' });
            deck.push({ suit, value: 10, display: 'K' });
            deck.push({ suit, value: 11, display: 'A' });
        }
    }
    
    return deck.sort(() => Math.random() - 0.5);
}

function calculateScore(cards) {
    let score = 0;
    for (const card of cards) {
        if (card.display === 'A') {
            score += 11;
        } else if (card.display === 'K' || card.display === 'Q' || card.display === 'J') {
            score += 10;
        } else {
            score += card.value;
        }
    }
    
    while (score > 31 && cards.some(c => c.display === 'A')) {
        score -= 10;
    }
    
    return score;
}

// ===== PLAYER ACTIONS =====
function drawFromDeck() {
    if (!gameState.isPlayerTurn || !gameState.gameActive || gameState.deck.length === 0) return;
    
    const card = gameState.deck.pop();
    gameState.playerCards.push(card);
    gameState.currentPlayerRoundScore = calculateScore(gameState.playerCards);
    
    updateUI();
    showDiscardPrompt();
}

function drawFromDiscardFn() {
    if (!gameState.isPlayerTurn || !gameState.gameActive || gameState.discard.length === 0) return;
    
    const card = gameState.discard.pop();
    gameState.playerCards.push(card);
    gameState.currentPlayerRoundScore = calculateScore(gameState.playerCards);
    
    updateUI();
    showDiscardPrompt();
}

function showDiscardPrompt() {
    const cards = document.querySelectorAll('.player-hand .playable');
    cards.forEach((card, index) => {
        card.onclick = () => discardCard(index);
        card.style.cursor = 'pointer';
    });
    
    document.getElementById('gameStatus').textContent = 'Kies kaart om weg te gooien';
}

function discardCard(index) {
    const card = gameState.playerCards[index];
    gameState.discard.push(card);
    gameState.playerCards.splice(index, 1);
    gameState.currentPlayerRoundScore = calculateScore(gameState.playerCards);
    
    updateUI();
    
    const cards = document.querySelectorAll('.player-hand .playable');
    cards.forEach(card => {
        card.onclick = null;
        card.style.cursor = 'default';
    });
    
    gameState.isPlayerTurn = false;
    document.getElementById('gameStatus').textContent = 'AI speelt...';
    
    setTimeout(aiTurn, 1500);
}

function playerKnock() {
    if (!gameState.isPlayerTurn || !gameState.gameActive) return;
    
    gameState.gameActive = false;
    endRound();
}

// ===== AI LOGIC =====
function aiTurn() {
    if (!gameState.gameActive) return;
    
    const difficulty = gameState.difficulty === 'hard';
    let aiScore = gameState.currentAiRoundScore;
    
    if (aiScore < 21) {
        if (gameState.deck.length > 0) {
            gameState.aiCards.push(gameState.deck.pop());
        } else if (gameState.discard.length > 0) {
            gameState.aiCards.push(gameState.discard.pop());
        }
    } else if (aiScore === 31) {
        gameState.gameActive = false;
        endRound();
        return;
    } else if (aiScore >= 30 && !difficulty) {
        gameState.gameActive = false;
        endRound();
        return;
    } else if (aiScore >= 29 && difficulty) {
        if (Math.random() > 0.3) {
            gameState.gameActive = false;
            endRound();
            return;
        }
        if (gameState.deck.length > 0) {
            gameState.aiCards.push(gameState.deck.pop());
        }
    } else {
        if (gameState.deck.length > 0) {
            gameState.aiCards.push(gameState.deck.pop());
        }
    }
    
    gameState.currentAiRoundScore = calculateScore(gameState.aiCards);
    
    if (gameState.currentAiRoundScore > 31) {
        gameState.gameActive = false;
        endRound();
        return;
    }
    
    const discardIndex = Math.floor(Math.random() * gameState.aiCards.length);
    gameState.discard.push(gameState.aiCards[discardIndex]);
    gameState.aiCards.splice(discardIndex, 1);
    
    gameState.isPlayerTurn = true;
    updateUI();
}

// ===== ROUND END =====
function endRound() {
    gameState.gameActive = false;
    
    let playerScore = calculateScore(gameState.playerCards);
    let aiScore = calculateScore(gameState.aiCards);
    
    let playerBust = playerScore > 31;
    let aiBust = aiScore > 31;
    
    let winner = '';
    let message = '';
    
    if (playerBust && aiBust) {
        winner = 'draw';
        message = 'Beiden zijn over de 31 gegaan! Gelijkspel.';
    } else if (playerBust) {
        winner = 'ai';
        message = 'Je bent over de 31 gegaan! AI wint.';
        gameState.aiScore++;
    } else if (aiBust) {
        winner = 'player';
        message = 'AI is over de 31 gegaan! Jij wint!';
        gameState.playerScore++;
    } else if (playerScore > aiScore) {
        winner = 'player';
        message = `Jij: ${playerScore} - AI: ${aiScore}. Jij wint!`;
        gameState.playerScore++;
    } else if (aiScore > playerScore) {
        winner = 'ai';
        message = `AI: ${aiScore} - Jij: ${playerScore}. AI wint!`;
        gameState.aiScore++;
    } else {
        winner = 'draw';
        message = `Beide ${playerScore}. Gelijkspel!`;
    }
    
    const historyEntry = {
        round: gameState.currentRound,
        playerScore: playerScore,
        aiScore: aiScore,
        winner: winner,
        message: message
    };
    gameState.gameHistory.push(historyEntry);
    
    document.getElementById('endTitle').textContent = 
        winner === 'player' ? '🏆 JIJ WINT! 🏆' : 
        winner === 'ai' ? '⚔️ AI WINT ⚔️' : 
        '⚖️ GELIJKSPEL ⚖️';
    document.getElementById('endPlayerScore').textContent = playerScore;
    document.getElementById('endAiScore').textContent = aiScore;
    document.getElementById('endMessage').textContent = message;
    
    showScreen('endScreen');
}

function nextRound() {
    if (gameState.currentRound < gameState.totalRounds) {
        gameState.currentRound++;
        initializeRound();
        showScreen('gameScreen');
    } else {
        showGameOver();
    }
}

function showGameOver() {
    let finalMessage = '';
    if (gameState.playerScore > gameState.aiScore) {
        finalMessage = `🏆 JIJ HEBT GEWONNEN!\nJij: ${gameState.playerScore} - AI: ${gameState.aiScore}`;
    } else if (gameState.aiScore > gameState.playerScore) {
        finalMessage = `⚔️ AI HAS WON\nAI: ${gameState.aiScore} - Jij: ${gameState.playerScore}`;
    } else {
        finalMessage = `⚖️ GELIJKSPEL!\nJij: ${gameState.playerScore} - AI: ${gameState.aiScore}`;
    }
    
    document.getElementById('endTitle').textContent = 'SPEL VOORBIJ';
    document.getElementById('endPlayerScore').textContent = gameState.playerScore;
    document.getElementById('endAiScore').textContent = gameState.aiScore;
    document.getElementById('endMessage').textContent = finalMessage;
    document.getElementById('nextRoundBtn').style.display = 'none';
    
    showScreen('endScreen');
}

function confirmEndGame() {
    if (confirm('Wil je het spel echt stoppen?')) {
        backToMenu();
    }
}

function backToMenu() {
    document.getElementById('nextRoundBtn').style.display = 'block';
    gameState.playerScore = 0;
    gameState.aiScore = 0;
    gameState.gameHistory = [];
    showScreen('startScreen');
}

// ===== UI UPDATES =====
function updateUI() {
    document.getElementById('playerScore').textContent = gameState.playerScore;
    document.getElementById('aiScore').textContent = gameState.aiScore;
    document.getElementById('currentRound').textContent = gameState.currentRound;
    document.getElementById('totalRounds').textContent = gameState.totalRounds;
    
    const playerRoundScoreEl = document.getElementById('playerRoundScore');
    if (playerRoundScoreEl) {
        playerRoundScoreEl.textContent = 
            gameState.currentPlayerRoundScore + (gameState.currentPlayerRoundScore > 31 ? ' (OVER!)' : '');
    }
    
    document.getElementById('gameStatus').textContent = 
        gameState.isPlayerTurn ? 'Jouw beurt' : 'AI speelt...';
    document.getElementById('deckCount').textContent = gameState.deck.length;
    
    updateHandDisplay('player');
    updateHandDisplay('ai');
    updateDiscardDisplay();
}

function updateHandDisplay(player) {
    const cards = player === 'player' ? gameState.playerCards : gameState.aiCards;
    const container = player === 'player' ? 
        document.querySelector('.player-hand') : 
        document.querySelector('.ai-hand');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < 3; i++) {
        const card = document.createElement('div');
        
        if (i < cards.length) {
            const cardData = cards[i];
            card.className = 'card ' + (player === 'player' ? 'playable' : 'back');
            
            if (player === 'player') {
                card.innerHTML = `<div class="card-inner">${cardData.display}${SUITS[cardData.suit]}</div>`;
            } else {
                card.innerHTML = '<div class="card-back">🛡️</div>';
            }
        } else {
            card.className = 'card';
            card.style.visibility = 'hidden';
        }
        
        container.appendChild(card);
    }
}

function updateDiscardDisplay() {
    const discardPile = document.getElementById('discardPile');
    if (!discardPile) return;
    
    if (gameState.discard.length > 0) {
        const topCard = gameState.discard[gameState.discard.length - 1];
        discardPile.innerHTML = `<div class="card-inner">${topCard.display}${SUITS[topCard.suit]}</div>`;
        discardPile.style.color = SUIT_COLORS[topCard.suit];
    } else {
        discardPile.innerHTML = '<div class="card-inner">-</div>';
    }
}

function toggleHistoryClick() {
    const content = document.getElementById('historyContent');
    const btn = document.getElementById('toggleHistory');
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        btn.textContent = '▲';
        updateHistoryDisplay();
    } else {
        content.classList.add('hidden');
        btn.textContent = '▼';
    }
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    gameState.gameHistory.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'history-entry';
        div.textContent = `Ronde ${entry.round}: ${entry.message}`;
        historyList.appendChild(div);
    });
}

// ===== SCREEN MANAGEMENT =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}
