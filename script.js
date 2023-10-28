"use strict";

/**
 * Запись данных в локальное хранилище
 * @param {string} item
 * @param {string} value
 */
function setLocalStorage(item, value) {
    localStorage.setItem(item, value);
}

/**
 * Получение данных из локального хранилища
 * @param {string} item
 * @returns {string}
 */
function getFromLocalStorage(item) {
    return localStorage.getItem(item)
}

const notice = $('.notice');
const noticeText = $('.notice__text');
const gameField = $('.game__field'); // Блок с карточками
const toolbar = $('.toolbar');
const startField = $('.game__start');
const diffBtn = $('.difficulty').find('.difficulty__item');
const homeBtn = $('.toolbar__button__home');
const newGameBtn = $('toolbar__button__new');
const startGameBtn = $('.game__play-btn');

let diffGameParameters = $('.selected_diff').attr('data-diff');
let cardsOnField = null;
let allCards = null; // Все карты на игровой области
let cardsBackground = null; // Обложки карт
let selectedCards = null; // Переменная для отметки выбранных карт

const game = {
    playerName: null, lifeCount: null, cardCount: null, // Кол-во карт в раунде
    cardsWithBugs: null, // Карты с багами
    firstViewCardsTime: null // Время на просмотр карт перед началом раунда
}

// Возврат на главный экран из бара управления игрой
homeBtn.click(() => {
    location.reload();
});

// Начало новой игры из бара управления игрой
newGameBtn.click(() => {
    startGame();
})

// Начало игры
startGameBtn.click(() => {
    startGame();
})

/**
 * Установка имени игрока
 */
function setPlayerName() {
    let toolbarNameField = $('.toolbar__player-name');
    game.playerName = getFromLocalStorage('playerName');

    if (game.playerName !== null && game.playerName.length !== 0) {
        toolbarNameField.text('Здравствуй, ' + game.playerName);
    } else {
        game.playerName = prompt('Введите свое имя!');
        if (game.playerName) {
            setLocalStorage('playerName', game.playerName)
            setPlayerName();
        } else {
            this.location.reload()
        }
    }
}

/**
 * Работа с уведомлением
 * @param message Выводимое сообщение
 * @param yesCallback функция, выполняемая при ответе "Да"
 */
function getNotice(message, yesCallback) {
    notice.css({'display': 'flex'});
    noticeText.html(message);

    $('#btnYes').click(function () {
        notice.hide();
        yesCallback();
    });

    $('#btnNo').click(function () {
        notice.hide();
        setTimeout(function () {
            cardsOnField.remove();
            location.reload();
        }, 200)
        // noCallback();
    });
}


// Перебираем все кнопки выбора сложности и отслеживаем нажатие
diffBtn.each(function () {
    let clickedBtn = $(this);

    clickedBtn.click(function () {
        diffBtn.removeClass('selected_diff');
        clickedBtn.addClass('selected_diff');
        // Запись сложности в переменную
        diffGameParameters = clickedBtn.attr('data-diff'); // difficulty Game Parameters
        // добавляем в game__field класс соответствующий сложности для адаптации размера карт
        gameField.removeClass().addClass(['game__field ' + diffGameParameters]);
    });
});

/**
 * Определение параметров игры в зависимости от сложности
 */
function setGameParameters() {
    /*
    добавляем в game__field класс соответствующий сложности для адаптации размера кард
    gameField.removeClass().addClass(['game__field ' + diffGameParameters]);
    Определение игровых параметров в зависимости от уровня сложности
    */

    switch (diffGameParameters) {
        case 'easy':
            game.lifeCount = 3
            game.cardCount = 12;
            game.cardsWithBugs = 2;
            game.firstViewCardsTime = 3000;
            break;
        case 'normal':
            game.lifeCount = 4
            game.cardCount = 18;
            game.cardsWithBugs = 4;
            game.firstViewCardsTime = 5000;
            break;
        case 'hard':
            game.lifeCount = 5
            game.cardCount = 27;
            game.cardsWithBugs = 7;
            game.firstViewCardsTime = 11000;
            break;
        default:
            console.error('Не выбран уровень сложности игры!')
    }

    setLife(game.lifeCount)
}

// Функция проверки пройгрыша
function gameOver(isBug) {
    if (isBug === 1) {
        getNotice("<strong>Вы наткнулись на BugProd!</strong> <br> " + "Ваш путь тестировщика окончен. =( <br> Хотите повторить?", function () {
            startGame();
        })
    } else {
        game.lifeCount--
        setLife(game.lifeCount)
    }

    if (game.lifeCount === 0) {
        getNotice("<strong>У вас закончился КОФЕ!</strong><br>" + "Ваша жизнь не имеет смысла без кофе. " + "<br><br>Хотите сыграть еще раз?", function () {
            startGame();
        });
    }
}

/**
 * Проверки завершения раунда
 */
function checkRoundComplete() {
    let blockedCards = gameField.find('.card.blocked');
    if (Number(blockedCards.length) === Number(game.cardCount - game.cardsWithBugs)) {
        return getNotice('<strong>Вы вышли в релиз без багов!</strong> ' + '<br> Провести регресс повторно?', function () {
            startGame();
        });
    }
}

/**
 * Генерации индексов для карт, в которых будут баги
 * @param min минимальный индекс
 * @param max мвксимальный индекс
 * @param bugsCount кол-во багов в игре
 * @returns {*[]}
 */
function getCardsBgFunction(min, max, bugsCount) {
    let intArr = [];
    let finalArr = [];
    while (intArr.length <= max) {
        let int = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!intArr.includes(int)) {
            intArr.push(int)
        }
    }

    // Вырезаем из массива с индексами нужное кол-во индексов для карт с багами и записываем в финальный массив
    let bugs = intArr.splice(0, bugsCount);
    bugs.forEach(function (item) {
        finalArr.push({
            index: item, bg: '#EEE url("/files/cards/bug.svg") no-repeat center', card: 0,
        })
    });
    // Вырезаем из массива с индексами нужное кол-во индексов для карт с картинками и записываем в финальный массив
    let remainingCards = intArr.length / 2;
    for (let x = 0; x <= remainingCards; x++) {
        let cards = intArr.splice(0, 2);
        cards.forEach(function (item) {
            finalArr.push({
                index: item,
                bg: '#EEE url("/files/cards/card' + Number(x + 1) + '.svg") no-repeat center',
                card: Number(x + 1)
            });
        });
    }

    return finalArr;
}

function compareCards() {
    let cards = $(document).find('.card.opened:not(.blocked)');
    if (cards.eq(0).attr('data-card') === cards.eq(1).attr('data-card')) {
        cards.addClass('blocked');
        game.allCards.css({'pointer-events': 'auto'});
        return true;
    }
    return false;
}

/**
 * Очистка поля
 */
function clearField() {
    // Очистка поля
    cardsOnField = $('.card');
    cardsOnField.remove();
}

/**
 * Установка жизней
 * @param lifeCount кол-во жизней
 */
function setLife(lifeCount) {
    setLocalStorage('life', lifeCount);
    toolbar.find('.life').text('x' + lifeCount);
}

/**
 * Предусловия перед запуском игры
 */
function runGamePrecondition() {
    startField.hide();
    gameField.css('display', 'grid');
    toolbar.css('display', 'flex');
    for (let i = 0; i < game.cardCount; i++) {
        gameField.append('<div class="card grid__item" data-card=""><div class="card__body"></div></div>');
    }
    game.allCards = $(document).find('.card.grid__item').css({'pointer-events': 'none'}); // Находим все карты после создания игровой области
    cardsBackground = getCardsBgFunction(0, game.cardCount - 1, game.cardsWithBugs)
}

/**
 * Действия после нажатия на карту
 */
function cardClickHandler() {
    game.allCards.each(function (index) {
        let el = $(this);
        el.click(function () {
            if (el.hasClass('opened')) {
                console.warn('Карта уже открыта или вы завершили раунд');
            } else {
                el.addClass('opened');
                selectedCards++
            }

            let cardData = cardsBackground.find(item => item.index === index);
            let cardBg = cardData.bg;
            let cardNumber = cardData.card;

            el.find('.card__body').css({
                'background': cardBg, 'pointer-events': 'none',
            }).parent().attr('data-card', cardNumber);


            if (cardNumber === 0) {
                selectedCards = 0;
                console.error("Да это же баг! Вы проиграли =(")
                gameOver(1);
            } else if (selectedCards === 2) {
                game.allCards.css({'pointer-events': 'none'})
                if (compareCards()) {
                    selectedCards = 0;
                    checkRoundComplete();
                    console.log('%cКарты одинаковые! Ура!', `color:green;`);
                } else {
                    selectedCards = 0;
                    gameOver(0)
                    closeOpenedCards();
                    console.warn('Карты разные... =(')
                }
            } else if (selectedCards === 1) {
                console.log('Выбрана одна карта!')
            } else {
                console.error('Неизвестная отработка при сравнении карт. SelectCard === 0')
            }
        });
    });
}

/**
 * Открытие всех карт
 */
function openAllCards() {
    game.allCards.each(function (index) {
        let el = $(this);
        el.addClass('opened');

        let cardBg = cardsBackground.find(item => item.index === index).bg;
        setTimeout(function () {
            el.find('.card__body').css({
                'background': cardBg,
            });
        }, 750)

    });
}

/**
 * Закрытие всех открытых карт
 */
function closeOpenedCards() {
    let close = $(document).find('.card.opened:not(.blocked)');
    setTimeout(function () {
        close.removeClass('opened').find('.card__body').css({
            'background': 'sandybrown',
        });
        close.attr('data-card', '');
        game.allCards.css({'pointer-events': 'auto'})
    }, 1500);
}

/**
 * Начало раунда
 */
function startGame() {
    clearField();
    setPlayerName();
    setGameParameters();
    runGamePrecondition();

    console.log('Game start!');
    // Показываем карты в первый раз
    setTimeout(() => {
        openAllCards();
        setTimeout(closeOpenedCards, game.firstViewCardsTime)
    }, 500)

    cardClickHandler();
}