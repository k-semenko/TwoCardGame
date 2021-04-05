<!DOCTYPE HTML>
<html lang="ru">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="style/style.css" rel="stylesheet">
    <link rel="icon" href="favicon.svg" type="image/svg+xml">
    <meta charset="utf-8"/>
    <title>Game Two Card</title>
</head>
<body>
<main>
    <div class="notice">
        <div class="notice__card">
            <p class="notice__text text-center">Hello world</p>
            <hr>
            <div class="btn-group text-center">
                <button class="btn btn-success" id="btnYes">Yes</button>
                <button class="btn btn-danger" id="btnNo">No</button>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="toolbar">
            <div class="toolbar__buttons-group">
                <button class="toolbar__button btn btn-success toolbar__button__home" title="Home">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor"
                             class="bi bi-house" viewBox="0 0 16 16">
                            <path fill-rule="evenodd"
                                  d="M2 13.5V7h1v6.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V7h1v6.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5zm11-11V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z"/>
                            <path fill-rule="evenodd"
                                  d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z"/>
                        </svg>
                    <strong>Home</strong>
                </button>
                <button class="toolbar__button toolbar__button__new btn btn-primary" onclick="startGame()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor"
                             class="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
                            <path fill-rule="evenodd"
                                  d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
                            <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
                        </svg>
                    <strong>New Game</strong>
                </button>
            </div>
            <strong class="toolbar__player-name">Hello</strong>
            <!-- Тут генерятся жизни игрока при помощи JS-->
        </div>

        <div class="game text-center">
            <div class="game__start">
                <h1 class="game__description text-center m-0">This is my first game in JS</h1>
                <h1 class="game__title text-center">&laquo;Adventures of a Tester&raquo;</h1>
                <div class="game__play-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
                         class="bi bi-caret-right" viewBox="0 0 16 16">
                        <path d="M6 12.796V3.204L11.481 8 6 12.796zm.659.753l5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753z"/>
                    </svg>
                </div>

                <div class="difficulty">
                    <ul class="difficulty__list">
                        <li class="difficulty__item selected_diff" title="Easy" data-diff="easy">Easy</li>
                        <li class="difficulty__item" title="Normal" data-diff="normal">Normal</li>
                        <li class="difficulty__item" title="Hard" data-diff="hard">Hard</li>
                    </ul>
                </div>
            </div>

            <div class="game__field easy"></div>

        </div>
    </div>
</main>
<script src="jquery-3.6.0.min.js"></script>
<script src="script.js" type="text/javascript"></script>
</body>
</html>