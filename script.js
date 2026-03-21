"use strict";

function setLocalStorage(item, value) {
    localStorage.setItem(item, value);
}

function getFromLocalStorage(item) {
    return localStorage.getItem(item);
}

const notice = $(".notice");
const noticeText = $(".notice__text");
const gameField = $(".game__field");
const toolbar = $(".toolbar");
const startField = $(".game__start");
const diffBtn = $(".difficulty").find(".difficulty__item");
const homeBtn = $(".toolbar__button__home");
const startGameBtn = $(".game__play-btn");

let diffGameParameters = $(".selected_diff").attr("data-diff");

const game = {
    playerName: null,
    lifeCount: null,
    cardCount: null,
    cardsWithBugs: null,
    firstViewCardsTime: null,
    allCards: null,
    selectedCards: 0
};

homeBtn.click(function() { location.reload(); });
$(".toolbar__button__new").click(function() { startGame(); });
startGameBtn.click(function() { startGame(); });

function setPlayerName() {
    var toolbarNameField = $(".toolbar__player-name");
    game.playerName = getFromLocalStorage("playerName");
    if (game.playerName !== null && game.playerName.length !== 0) {
        toolbarNameField.text(game.playerName);
    } else {
        game.playerName = prompt("Введите свое имя!");
        if (game.playerName && game.playerName.trim()) {
            setLocalStorage("playerName", game.playerName.trim());
            setPlayerName();
        } else {
            location.reload();
        }
    }
}

function getNotice(message, yesCallback) {
    notice.css({ display: "flex" });
    noticeText.html(message);
    $("#btnYes").off("click").on("click", function() {
        notice.hide();
        yesCallback();
    });
    $("#btnNo").off("click").on("click", function() {
        notice.hide();
        setTimeout(function() { location.reload(); }, 200);
    });
}

diffBtn.each(function() {
    var clickedBtn = $(this);
    clickedBtn.click(function() {
        diffBtn.removeClass("selected_diff");
        clickedBtn.addClass("selected_diff");
        diffGameParameters = clickedBtn.attr("data-diff");
        gameField.removeClass().addClass("game__field " + diffGameParameters);
    });
});

function setGameParameters() {
    switch (diffGameParameters) {
        case "easy":
            game.lifeCount = 3; game.cardCount = 12; game.cardsWithBugs = 2; game.firstViewCardsTime = 3000; break;
        case "normal":
            game.lifeCount = 4; game.cardCount = 18; game.cardsWithBugs = 4; game.firstViewCardsTime = 5000; break;
        case "hard":
            game.lifeCount = 5; game.cardCount = 27; game.cardsWithBugs = 7; game.firstViewCardsTime = 11000; break;
    }
    setLife(game.lifeCount);
}

function gameOver(isBug) {
    if (isBug) {
        return getNotice("<strong>BugProd!</strong><br>Вы наткнулись на баг в проде.<br>Попробовать ещё раз?", function() { startGame(); });
    }
    game.lifeCount--;
    setLife(game.lifeCount);
    if (game.lifeCount === 0) {
        getNotice("<strong>Кофе закончился!</strong><br>Без кофе тестировщик бессилен.<br>Сыграть ещё раз?", function() { startGame(); });
    }
}

function checkRoundComplete() {
    var blockedCards = gameField.find(".card.blocked");
    if (blockedCards.length === game.cardCount - game.cardsWithBugs) {
        getNotice("<strong>Релиз без багов!</strong><br>Все пары найдены. Регресс пройден!<br>Ещё раз?", function() { startGame(); });
    }
}

function generateCardLayout(cardCount, bugsCount) {
    var pairCount = (cardCount - bugsCount) / 2;
    var layout = [];
    var bugBg = "#1a1a2e url(/files/cards/bug.svg) no-repeat center";
    for (var b = 0; b < bugsCount; b++) {
        layout.push({ bg: bugBg, card: 0 });
    }
    for (var p = 0; p < pairCount; p++) {
        var cardNum = (p % 13) + 1;
        var cardBg = "#1a1a2e url(/files/cards/card" + cardNum + ".svg) no-repeat center";
        layout.push({ bg: cardBg, card: p + 1 });
        layout.push({ bg: cardBg, card: p + 1 });
    }
    for (var i = layout.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = layout[i];
        layout[i] = layout[j];
        layout[j] = temp;
    }
    return layout;
}

function compareCards() {
    var cards = $(document).find(".card.opened:not(.blocked)");
    if (cards.length === 2 && cards.eq(0).attr("data-card") === cards.eq(1).attr("data-card")) {
        cards.addClass("blocked");
        game.allCards.css({ "pointer-events": "auto" });
        return true;
    }
    return false;
}

function clearField() { $(".card").remove(); }

function setLife(lifeCount) { toolbar.find(".life").text(lifeCount); }

function runGamePrecondition() {
    startField.hide();
    gameField.css("display", "grid");
    toolbar.css("display", "flex");
    for (var i = 0; i < game.cardCount; i++) {
        gameField.append('<div class="card grid__item" data-card=""><div class="card__body"></div></div>');
    }
    game.allCards = $(document).find(".card.grid__item").css({ "pointer-events": "none" });
}

function cardClickHandler(cardsLayout) {
    game.allCards.each(function(index) {
        var el = $(this);
        el.click(function() {
            if (el.hasClass("opened") || el.hasClass("blocked")) return;
            el.addClass("opened");
            game.selectedCards++;
            var cardData = cardsLayout[index];
            el.find(".card__body").css({ background: cardData.bg, "pointer-events": "none" }).parent().attr("data-card", cardData.card);
            if (cardData.card === 0) {
                game.selectedCards = 0;
                gameOver(true);
            } else if (game.selectedCards === 2) {
                game.allCards.css({ "pointer-events": "none" });
                if (compareCards()) {
                    game.selectedCards = 0;
                    checkRoundComplete();
                } else {
                    game.selectedCards = 0;
                    gameOver(false);
                    closeOpenedCards();
                }
            }
        });
    });
}

function openAllCards(cardsLayout) {
    game.allCards.each(function(index) {
        var el = $(this);
        el.addClass("opened");
        var cardBg = cardsLayout[index].bg;
        setTimeout(function() { el.find(".card__body").css({ background: cardBg }); }, 400);
    });
}

function closeOpenedCards() {
    var toClose = $(document).find(".card.opened:not(.blocked)");
    setTimeout(function() {
        toClose.removeClass("opened").find(".card__body").css({ background: "linear-gradient(135deg, #f0883e, #d29922)" });
        toClose.attr("data-card", "");
        game.allCards.css({ "pointer-events": "auto" });
    }, 1200);
}

function startGame() {
    clearField();
    setPlayerName();
    setGameParameters();
    runGamePrecondition();
    game.selectedCards = 0;
    var cardsLayout = generateCardLayout(game.cardCount, game.cardsWithBugs);
    setTimeout(function() {
        openAllCards(cardsLayout);
        setTimeout(closeOpenedCards, game.firstViewCardsTime);
    }, 500);
    cardClickHandler(cardsLayout);
}
