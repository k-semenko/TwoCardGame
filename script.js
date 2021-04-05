"use strict";

const notice = $('.notice');
const noticeText = $('.notice__text');
const gameField = $('.game__field'); // Блок с карточками
const toolbar = $('.toolbar');
const startField = $('.game__start');
const diffBtn = $('.difficulty').find('.difficulty__item');

let playerName = null;
let lifeCount = null;
let lifePic = null;
let cardsOnField = null;
let diffGameParameters = $('.selected_diff').attr('data-diff');
let allCards = null; // Все карты на игровой области
let cardCount = null; // Кол-во карт в раунде
let cardsWithBugs = null; // Карты с багами
let firstViewCardsTime = null; // Время на просмотр карт перед началом раунда
let getCardsBackground = null; // Обложки карт
let selectedCards = 0; // Переменная для отметки выбранных карт

// Кнопка возврата на главный экран в баре управления игрой
$('.toolbar__button__home').click(() => {
    location.reload();
});
// Кнопка начала новой игры в баре управления игрой
$('toolbar__button__new').click(() => {
    startGame();
})

$('.game__play-btn').click(() => {
    startGame();
})

function setPlayerName() {
    playerName = prompt('Введите свое имя!');
    let toolbarNameField = $('.toolbar__player-name');
    if (playerName.length !== 0) {
        toolbarNameField.text('Здравствуй, ' + playerName);
    } else {
        toolbarNameField.text('Неизвестный игрок.')
    }

}

function getNotice(message, yesCallback, noCallback) {
    notice.css({'display': 'flex'});
    noticeText.html(message);

    $('#btnYes').click(function () {
        notice.hide();
        yesCallback();
    });
    $('#btnNo').click(function () {
        notice.hide();
        setTimeout(function () {
            allCards.remove();
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
        console.log(diffGameParameters);
    });
});

// Функция Выставления параметров в зависимости от сложности
function setGameParameters() {
    /*
    добавляем в game__field класс соответствующий сложности для адаптации размера кард
    gameField.removeClass().addClass(['game__field ' + diffGameParameters]);
    Определение игровых параметров в зависимости от уровня сложности
    */

    switch (diffGameParameters) {
        case 'easy':
            lifeCount = 3
            cardCount = 12;
            cardsWithBugs = 2;
            firstViewCardsTime = 3000;
            break;
        case 'normal':
            lifeCount = 4
            cardCount = 18;
            cardsWithBugs = 4;
            firstViewCardsTime = 5000;
            break;
        case 'hard':
            lifeCount = 5
            cardCount = 27;
            cardsWithBugs = 7;
            firstViewCardsTime = 11000;

            break;
        default:
            console.error('Не выбран уровень сложности игры!')
    }
    // console.log('Сложность: ' + diffGameParameters +
    //     '\r\nКол-во карт: ' + cardCount +
    //     '\r\nКарт с багами: ' + cardsWithBugs +
    //     '\r\nВремя просмотра: ' + firstViewCardsTime / 1000 + ' сек.');
}

function generateLifePic(lifeCount) {
    for (let i = 0; i < lifeCount; i++) {
        toolbar.append('<div class="life"></div>');
    }
}


// Функция проверки пройгрыша
function gameOver(isBug) {
    if (isBug === 1) {
        getNotice("<strong>Вы наткнулись на BugProd!</strong> <br> " +
            "Ваш путь тестировщика окончен. =( <br> Хотите повторить?",
            function () {
                startGame();
            })
    } else {
        lifeCount--;
        lifePic = toolbar.find('.life');
        lifePic.eq(0).remove();
    }

    if (lifeCount === 0) {
        getNotice("<strong>У вас закончился КОФЕ!</strong><br>" +
            "Ваша жизнь не имеет смысла без кофе. " +
            "<br><br>Хотите сыграть еще раз?",
            function () {
                startGame();
            });
    }
}

// Функция проверки завершения раунда
function checkRoundComplete() {
    let blockedCards = gameField.find('.card.blocked');
    if (Number(blockedCards.length) === Number(cardCount - cardsWithBugs)) {
        return getNotice('<strong>Вы вышли в релиз без багов!</strong> ' +
            '<br> Провести регресс повторно?',
            function () {
                startGame();
            }
        );
    }
}

// Функция для генерации индексов для карт, в которых будут баги
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
            index: item,
            bg: '#EEE url("/files/cards/bug.svg") no-repeat center',
            card: 0,
        })
    });
    // Вырезаем из массива с индексами нужное кол-во индексов для карт с картинками и записываем в финальный массив
    let remainingCards = intArr.length / 2;
    for (let x = 0; x <= remainingCards; x++) {
        let cards = intArr.splice(0, 2);
        cards.forEach(function (item, index) {
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
        allCards.css({'pointer-events': 'auto'});
        return true;
    }
    return false;
}


// Запуск функции по формированию поля игры и начало раунда
function startGame() {
    // Установление имени игрока
    setPlayerName();
    // Поиск всех карт и иконок жизней на поле
    cardsOnField = $('.card');
    lifePic = toolbar.find('.life'); // Иконки жизней
    // Очистка поля
    lifePic.remove();
    cardsOnField.remove();

    // Определяем параметры игры
    setGameParameters();
    // Генерация иконок жизней
    generateLifePic(lifeCount);
    console.log('Game start!');
    startField.hide();
    gameField.css('display', 'grid');
    toolbar.css('display', 'flex');
    for (let i = 0; i < cardCount; i++) {
        gameField.append('<div class="card grid__item" data-card=""><div class="card__body"></div></div>');
    }
    allCards = $(document).find('.card.grid__item').css({'pointer-events': 'none'}); // Находим все карты после создания игровой области
    getCardsBackground = getCardsBgFunction(0, cardCount - 1, cardsWithBugs)

    // Показываем карты в первый раз
    setTimeout(() => {
        openAllCards();
        setTimeout(closeOpenedCards, firstViewCardsTime)
    }, 500)
    cardClick();
}

// Отработка действий после нажатия на карту
function cardClick() {
    allCards.each(function (index) {
        let el = $(this);
        el.click(function () {
            if (el.hasClass('opened')) {
                console.warn('Карта уже открыта или вы завершили раунд');
            } else {
                el.addClass('opened');
                selectedCards++
            }

            let cardData = getCardsBackground.find(item => item.index === index);
            let cardBg = cardData.bg;
            let cardNumber = cardData.card;
            el.find('.card__body').css({
                'background': cardBg,
                'pointer-events': 'none',
            }).parent().attr('data-card', cardNumber);


            if (cardNumber === 0) {
                selectedCards = 0;
                lifePic.hide()
                console.error("Да это же баг! Вы проиграли =(")
                gameOver(1);
            } else if (selectedCards === 2) {
                allCards.css({'pointer-events': 'none'})
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

// Функция открытия всех карт
function openAllCards() {
    allCards.each(function (index) {
        let el = $(this);
        el.addClass('opened');

        let cardBg = getCardsBackground.find(item => item.index === index).bg;
        setTimeout(function () {
            el.find('.card__body').css({
                'background': cardBg,
            });
        }, 750)

    });
}

// Функция закрытия всех открытых карт
function closeOpenedCards() {
    let close = $(document).find('.card.opened:not(.blocked)');
    setTimeout(function () {
        close.removeClass('opened').find('.card__body').css({
            'background': 'sandybrown',
        });
        allCards.css({'pointer-events': 'auto'})
    }, 1500);
}
