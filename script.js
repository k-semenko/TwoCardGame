$(document).ready(function () {

    const notice = $('#notice');
    const noticeText = $('#notice-text');
    const playBtn = $('.newGameBtn'); //Кнопка запуска игры
    const gameField = $('.game > .game_field'); // Блок с карточками
    const toolbar = $('#toolbar');
    const startField = $('.game > .start_field');

    let life = 3;
    let lifePic = toolbar.find('.life'); // Иконки жизней
    let cardCount = 12; // Кол-во карт в раунде
    let cardsWithBugs = 2; // Карты с багами
    let firstViewCardsTime = 2000; // Время на просмотр карт перед началом раунда
    let allCards = {}; // Все карты на игровой области
    let getCardsBackground = []; // Обложки карт
    let selectedCards = 0; // Переменная для отметки выбранных карт


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

    //Функция изменени размера карт в зависимости от кол-ва карт и разрешения экрана
    function getCardsSize() {
        let windowSize = $(document).width();
        let size;

        if (cardCount === 12) {
            size = {'width': '140', 'height': '220'};
        } else if (cardCount === 15) {
            size = {'width': '130', 'height': '200', 'margin': '15px 40px'};
        } else if (cardCount === 32) {
            size = {'width': '80', 'height': '150', 'margin': '15px 25px'};
        }

        allCards.each(function () {
            $(this).css(size);
            console.log('Change card size');
        });
    }

    function selectDifficulty() {
        let diffBtn = $('.difficulty').find('li');
        diffBtn.each(function () {
            let btn = $(this);
            btn.click(function () {
                diffBtn.removeClass('selected_diff');
                btn.addClass('selected_diff');

                // Запись сложности в переменную
                let diffGP = btn.attr('data-diff'); // cardCount Game Parameters

                // Определение игровых параметров в зависимости от уровня сложности
                if (diffGP === 'Easy') {
                    cardCount = 12;
                    cardsWithBugs = 2;
                    firstViewCardsTime = 2000;
                } else if (diffGP === 'Normal') {
                    cardCount = 15;
                    cardsWithBugs = 3;
                    firstViewCardsTime = 4000;
                } else if (diffGP === 'Hard') {
                    cardCount = 32;
                    cardsWithBugs = 6;
                    firstViewCardsTime = 6000;
                } else {
                    console.error('Не выбран уровень сложности игры!')
                }
            });
        });
    }

    function gameOver(minus) {
        if (minus === 'Bug') {
            getNotice("<strong>Вы наткнулись на BugProd!</strong> <br> " +
                "Ваш путь тестировщика окончен. =( <br> Хотите повторить?",
                function () {
                    life = 3;
                    lifePic.show();
                    allCards.remove();
                    startGame();
                })
        } else {
            life--;
            lifePic.eq(life).hide();
        }

        if (life === 0) {
            getNotice("<strong>У вас закончился КОФЕ!</strong><br> Ваша жизнь не имеет смысла без кофе. " +
                "<br><br>Хотите сыграть еще раз?",
                function () {
                    life = 3;
                    lifePic.show();
                });
        }
    }

    function checkRoundComplete() {
        let blockedCards = $('.game_field').find('.card.blocked');
        if (Number(blockedCards.length) === Number(cardCount - cardsWithBugs)) {
            return getNotice('<strong>Поздравляю!</strong> <br>Вы победили в этом рауне! <br> Сыграем еще раз?')
        }
    }

    // Функция для генерации индексов для карт, в которых будут баги
    function getCardsBgFunction(min, max, bugsCount) {
        // Объявляем переменные массивов для генерации индексов карт и финального массива с background-image
        let intArr = [];
        let finalArr = [];
// Формируем массив с индексами карт в случайном порядке
        for (let i = 0; i <= max; i++) {
            let int = Math.floor(Math.random() * (max - min + 1)) + min;
            if (intArr.indexOf(int) === -1 || intArr.length === 0) {
                intArr.push(int)
            } else {
                i--
            }
        }

        // Вырезаем из массива с индексами нужное кол-во индексов для карт с багами и записываем в финальный массив
        let bugs = intArr.splice(0, bugsCount);
        bugs.forEach(function (item, index, array) {
            finalArr.push({
                index: item,
                bg: 'red url("/files/cards/bug.svg") no-repeat center',
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
                    bg: '#FFF url("/files/cards/card' + Number(x + 1) + '.svg") no-repeat center',
                    card: Number(x + 1)
                });
            });
        }
        // Возвращаем финальный массив
        return finalArr;
    }

    function compareCards() {
        let cards = $(document).find('.card.opened:not(.blocked) > .card-body');
        if (cards.eq(0).attr('data-card') === cards.eq(1).attr('data-card')) {
            // cards.parent().remove();
            cards.parent().css({'background': 'rgba(0, 0, 0, 0)', 'box-shadow': 'none'}).addClass('blocked');
            allCards.css({'pointer-events': 'auto'});
            return true;
        }
        return false;
    }


    // Скрытие кнопки запуска игры после нажатия и отображение игровой области
    // Запуск функции по формированию поля игры и начало раунда
    selectDifficulty();
    playBtn.click(function () {
        startGame();
    });

    function startGame() {
        // Запуск функции по изменению размера карт при изменении размера экрана
        $(window).resize(() => {
            getCardsSize()
        });

        console.log('Game start!');
        startField.hide();
        gameField.css('display', 'flex');
        toolbar.css('display', 'flex');
        for (let i = 0; i < cardCount; i++) {
            gameField.append('<div class="card" data-card=""><div class="card-body"></div></div>');
        }
        allCards = $(document).find('.card'); // Находим все карты после создания игровой области
        cardCount = allCards.length; // Считаем кол-во карт
        getCardsSize(); // Получаем размеры карт

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
                    console.warn('Карта уже открыта или вы завершили раунд')
                    return false;
                } else {
                    el.addClass('opened');
                    selectedCards++
                }

                let cardData = getCardsBackground.find(item => item.index === index);
                let cardBg = cardData.bg;
                let cardNumber = cardData.card;

                el.find('.card-body').css({
                    'background': cardBg,
                    'pointer-events': 'none',
                }).attr('data-card', cardNumber);

                if (cardNumber === 0) {
                    selectedCards = 0;
                    lifePic.hide()
                    console.error("Да это же баг! Вы проиграли =(")
                    gameOver('Bug');
                } else if (selectedCards === 2) {
                    allCards.css({'pointer-events': 'none'})
                    if (compareCards()) {
                        selectedCards = 0;
                        checkRoundComplete();
                        console.log('%cКарты одинаковые! Ура!', `color:green;`);
                    } else {
                        selectedCards = 0;
                        gameOver(1)

                        closeOpenedCards();
                        console.warn('Карты разные... =(')
                    }
                } else if (selectedCards === 1) {
                    console.log('Выбрана одна карта!')
                } else {
                    console.error('Неизвестная отработка при сравнении карт.')
                }
            });
        });
    }

    // Функция открытия всех карт
    function openAllCards() {
        allCards.css({'pointer-events': 'auto'});
        allCards.each(function (index) {
            let el = $(this);
            el.addClass('opened');

            let cardBg = getCardsBackground.find(item => item.index === index).bg;
            el.find('.card-body').css({
                'background': cardBg,
            });
        });
    }

    // Функция закрытия всех открытых карт
    function closeOpenedCards() {
        let close = $(document).find('.card.opened:not(.blocked)');
        setTimeout(function () {
            close.removeClass('opened').find('.card-body').css({
                'background': 'sandybrown',
            });

            allCards.css({'pointer-events': 'auto'});
        }, 1500);
    }

})