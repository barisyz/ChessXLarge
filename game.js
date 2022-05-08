const k = kaboom({ global: true });

layers([
  "bg",
  "game",
  "ui",
], "game");

loadSpriteAtlas("sprites/ChessSprites.png", {
  "upLeft": { x: 0, y: 0, width: 90, height: 90 },
  "upRight": { x: 218, y: 0, width: 90, height: 90 },
  "downLeft": { x: 0, y: 90, width: 90, height: 90 },
  "downRight": { x: 218, y: 90, width: 90, height: 90 },
  "topBlack": { x: 90, y: 0, width: 64, height: 90 },
  "topWhite": { x: 154, y: 0, width: 64, height: 90 },
  "bottomBlack": { x: 154, y: 90, width: 64, height: 90 },
  "bottomWhite": { x: 90, y: 90, width: 64, height: 90 },
  "white": { x: 320, y: 0, width: 64, height: 64 },
  "black": { x: 320, y: 96, width: 64, height: 64 },
  "white_and_black": { x: 26, y: 26, width: 128, height: 64 },
  "black_king": { x: 0, y: 192, width: 64, height: 64 },
  "black_queen": { x: 64, y: 192, width: 64, height: 64 },
  "black_bishop": { x: 128, y: 192, width: 64, height: 64 },
  "black_knight": { x: 192, y: 192, width: 64, height: 64 },
  "black_rook": { x: 256, y: 192, width: 64, height: 64 },
  "black_pawn": { x: 320, y: 192, width: 64, height: 64 },
  "white_king": { x: 0, y: 256, width: 64, height: 64 },
  "white_queen": { x: 64, y: 256, width: 64, height: 64 },
  "white_bishop": { x: 128, y: 256, width: 64, height: 64 },
  "white_knight": { x: 192, y: 256, width: 64, height: 64 },
  "white_rook": { x: 256, y: 256, width: 64, height: 64 },
  "white_pawn": { x: 320, y: 256, width: 64, height: 64 },
  /*   "dark_king": { x: 0, y: 330, width: 64, height: 64 },
    "dark_queen": { x: 64, y: 330, width: 64, height: 64 },
    "dark_bishop": { x: 128, y: 330, width: 64, height: 64 },
    "dark_knight": { x: 192, y: 330, width: 64, height: 64 },
    "dark_rook": { x: 256, y: 330, width: 64, height: 64 },
    "dark_pawn": { x: 320, y: 330, width: 64, height: 64 },
    "light_king": { x: 0, y: 394, width: 64, height: 64 },
    "light_queen": { x: 64, y: 394, width: 64, height: 64 },
    "light_bishop": { x: 128, y: 394, width: 64, height: 64 },
    "light_knight": { x: 192, y: 394, width: 64, height: 64 },
    "light_rook": { x: 256, y: 394, width: 64, height: 64 },
    "light_pawn": { x: 320, y: 394, width: 64, height: 64 }, */
});

loadSound("placement", "./sounds/placement.mp3");
loadSound("timer", "./sounds/timer.mp3");
loadSound("timesup", "./sounds/timesup.wav");

const SPRITE_SIZE = 64;
const BOARD_ROW = 32;
const BOARD_COLUMN = 32;
const BOARD_WIDTH = SPRITE_SIZE * BOARD_ROW;
const BOARD_HEIGHT = SPRITE_SIZE * BOARD_COLUMN;
const BOARD_START_POS = vec2(0, SPRITE_SIZE);

const colorTypes = {
  white: "white",
  black: "black",
  light: "light",
  dark: "dark"
}

const colorTypeIds = {
  0: "white",
  1: "black",
  2: "light",
  3: "dark"
}

const colorTypeCharacters = {
  white: ["1", "2", "3", "4", "5", "6"],
  black: ["q", "w", "e", "r", "t", "y"],
  light: ["a", "s", "d", "f", "g", "h"],
  dark: ["z", "x", "c", "v", "b", "n"]
}

const unitTypes = {
  king: "king",
  queen: "queen",
  knight: "knight",
  bishop: "bishop",
  rook: "rook",
  pawn: "pawn"
}

const unitTypeIds = {
  king: 0,
  queen: 1,
  knight: 2,
  bishop: 3,
  rook: 4,
  pawn: 5
}

const unitValues = {
  king: 30,
  queen: 20,
  knight: 15,
  bishop: 15,
  rook: 15,
  pawn: 5
}

const unitMoveSet = {
  king: { captureSame: true, freeMovement: true, moves: [vec2(-1, 0), vec2(1, 0), vec2(0, 1), vec2(0, -1), vec2(1, -1), vec2(1, 1), vec2(-1, 1), vec2(-1, -1)] },
  queen: { captureSame: true, freeMovement: false, moves: [vec2(-1, 0), vec2(1, 0), vec2(0, 1), vec2(0, -1), vec2(1, -1), vec2(1, 1), vec2(-1, 1), vec2(-1, -1)] },
  knight: { captureSame: true, freeMovement: false, moves: [vec2(1, 2), vec2(1, -2), vec2(-1, 2), vec2(-1, -2), vec2(2, 1), vec2(2, -1), vec2(-2, 1), vec2(-2, -1)] },
  bishop: { captureSame: true, freeMovement: true, moves: [vec2(1, -1), vec2(1, 1), vec2(-1, 1), vec2(-1, -1)] },
  rook: { captureSame: true, freeMovement: true, moves: [vec2(-1, 0), vec2(1, 0), vec2(0, 1), vec2(0, -1)] },
  pawn: { captureSame: false, freeMovement: false, moves: [vec2(0, -1)], capture: [vec2(1, -1), vec2(-1, -1)] }
};

const playerColor = colorTypes.white;
let score = 0;

scene("game", () => {

  score = 0;

  function generateChessBoard(x, y) {
    let board = new Array(y).fill("*".repeat(x));

    let arr = [];
    const maxElemSize = x * y;
    const randSize = randi(maxElemSize / 8, maxElemSize / 5);

    while (arr.length < randSize) {
      var r = randi(0, maxElemSize);
      if (arr.indexOf(r) === -1) arr.push(r);
    }

    for (let i = 0; i < arr.length; i++) {
      const currVal = arr[i];
      const newY = Math.floor(currVal / y);
      const newX = currVal % x;
      const old = board[newY][newX];

      if (board[newY] != undefined && board[newY][newX] != undefined) {
        const newVal = k.choose(
          ["1", "2", "3", "4", "5", "6",
            "q", "w", "e", "r", "t", "y",
            //"a", "s", "d", "f", "g", "h",
            //"z", "x", "c", "v", "b", "n"
          ]);

        board[newY] = replaceAt(board[newY], newX, newVal);
      } else {
        debug.log("Error on i: " + i + " s:" + Math.floor(currVal / y) + " d:" + currVal % x)
      }
    }
    /*
     board[0] = "sd".repeat(x / 2);
     board[0][0] = "7";
     board[0][board[0].length - 1] = "9";
     board[board.length - 1] = "xc".repeat(x / 2);
     board[board.length - 1][0] = "1";
     board[board.length - 1][board.length - 1] = "3";
     */
    return board;
  }

  function getBoardComponents(_spriteName) {
    return [sprite(_spriteName), area(), "tile", layer("bg")];
  }

  function getPieceComponents(colorType, unitType) {
    return [sprite(colorType + "_" + unitType), chessPiece(colorType, unitType), area(), outline(1, rgb(0, 0, 255)), colorType, "chessPiece"];
  }

  //converts board pos to game pos
  function getPos(boardPos) {
    return vec2(SPRITE_SIZE * boardPos.x + BOARD_START_POS.x, SPRITE_SIZE * boardPos.y + BOARD_START_POS.y);
  }

  function getBoardPos(vec) {
    return vec2(Math.floor((vec.x - BOARD_START_POS.x) / SPRITE_SIZE), Math.floor((vec.y - BOARD_START_POS.y) / SPRITE_SIZE));
  }

  function printVec(vec) {
    return "(" + vec.x + "," + vec.y + ")";
  }

  function checkPos(boardPos) {
    return boardPos != null && boardPos.y >= 0 && gameState.board.length > boardPos.y
      && boardPos.x >= 0 && gameState.board[boardPos.y].length > boardPos.x;
  }

  function chessPiece(_color, _unitType) {
    return {
      id: "chessPieceComp",
      pieceColor: _color,
      unitType: _unitType,
      require: ["pos"],
      getMoveSet: function () { return unitMoveSet[this.unitType]; },
      go: function (newBoardPos) {
        if (!checkPos(newBoardPos)) {
          return false;
        }

        const moveSet = this.getMoveSet();
        const thisBoardPos = getBoardPos(this.pos);
        const angle = thisBoardPos.angle(newBoardPos);

        for (let i = 0; i < moveSet.moves.length; i++) {
          const m = moveSet.moves[i];

          //console.log("Move angle: ", vec2(0, 0).angle(m), "m: ", printVec(m));

          if ((!moveSet.freeMovement && thisBoardPos.add(m).eq(newBoardPos)) ||
            (moveSet.freeMovement && (vec2(0, 0).angle(m) == angle) && !isThereAnyPieceBetween(thisBoardPos, newBoardPos, m))) {
            updateChessBoard(getPieceCh(this.pieceColor, this.unitType), newBoardPos);
            updateChessBoard("*", thisBoardPos);
            this.moveTo(getPos(newBoardPos));
            play("placement");
            return true;
          }
        }
        return false;
      },
      capture: function (otherPiece) {
        if (this.go(getBoardPos(otherPiece.pos))) {
          destroy(otherPiece);
          return true;
        }

        return false;
      }
    }
  }

  function getPieceCh(color, type) {
    return colorTypeCharacters[color][unitTypeIds[type]];
  }

  function updateChessBoard(ch, pos) {
    gameState.board[pos.y] = replaceAt(gameState.board[pos.y], pos.x, ch);
  }

  function getPieceFromBoard(boardPos) {
    if (checkPos(boardPos)) {
      return gameState.board[boardPos.y][boardPos.x];
    }
    return null;
  }

  function replaceAt(str, idx, ch) {
    return str.substring(0, idx) + ch + str.substring(idx + 1);
  }

  function isThereAnyPieceBetween(startPos, endPos, mov) {
    const count = Math.floor(startPos.dist(endPos)) - 1;
    let currPos = startPos;

    for (let i = 0; i < count; i++) {
      currPos = currPos.add(mov);
      const piece = getPieceFromBoard(currPos);

      if (!currPos.eq(endPos) && piece != null && piece != "*") {
        return true;
      }
    }

    return false;
  }

  let gameState = {
    isGameStarted: false,
    playerCount: 2,
    board: {},
    currentPlayerId: 0,
    currentPlayerColor: function () { return colorTypeIds[this.currentPlayerId] },
    enemyPlayerColor: function () {return this.currentPlayerId == 0 ? colorTypeIds[1] : colorTypeIds[0]; },
    turnDuration: 10,
    turnStartTime: null,
    isPlayerAi: function () { return this.currentPlayerColor() != playerColor; },
    turnNextPlayer: function () {
      deselect();
      this.currentPlayerId = (this.currentPlayerId + 1) % this.playerCount;
      currentPlayingLabel.text = "Player: " + this.currentPlayerColor();
    },
    finishTurn: function () {
      this.turnStartTime = null;
      this.turnNextPlayer();
      play("timesup");
      wait(1, this.startTimer());
    },
    startTimer: function () {
      if (this.turnStartTime == null) {
        this.turnStartTime = time();
        play("timer");
        wait(this.turnDuration, () => {
          this.finishTurn();
        });
      }
    }
  }

  function moveAi() {
    const allPieces = get(gameState.currentPlayerColor());
    const enemyPieces = get(gameState.enemyPlayerColor());

    if (allPieces.length > 0) {
      const aiSelectedPiece = allPieces[randi(0, allPieces.length)];

      let nearEnemy = enemyPieces[0];
      let posDiff = nearEnemy.pos.dist(aiSelectedPiece.pos);

      for (let i = 0; i < enemyPieces.length; i++) {
        const diff = enemyPieces[i].pos.dist(aiSelectedPiece.pos);
        if (posDiff > diff) {
          posDiff = diff;
          nearEnemy = enemyPieces[i];
        }
      }

      const isCaptured = nearEnemy != null && aiSelectedPiece.capture(nearEnemy);

      if (!isCaptured) {
        const moveSet = aiSelectedPiece.getMoveSet();
        const randomMove = choose(moveSet.moves);
        if (moveSet.freeMovement) {
          aiSelectedPiece.go(getBoardPos(aiSelectedPiece.pos).add(randomMove.scale(posDiff)));
        } else {
          aiSelectedPiece.go(getBoardPos(aiSelectedPiece.pos).add(randomMove));
        }
      } else {
        debug.log("Ai captured");
      }
    }
  }

  function selectPiece(_piece) {
    if (currSelectedPiece != null) {
      deselect();
    }
    currSelectedPiece = _piece;
    currSelectedPiece.lineColor = rgb(255, 255, 0);
    currSelectedPiece.lineWidth = 4;
  }

  function deselect() {
    if (currSelectedPiece != null) {
      currSelectedPiece.lineColor = rgb(0, 0, 255);
      currSelectedPiece.lineWidth = 1;
    }

    currSelectedPiece = null;
  }

  function checkIsGameFinished() {
    const whiteCount = get("white").length;
    const blackCount = get("black").length;
    if (whiteCount == 0 || blackCount == 0) {
      debug.log((whiteCount > 0 ? "white" : "black") + " wins");
      go("score");
    }
  }

  clicks("chessPiece", (_piece) => {
    if (gameState.currentPlayerColor() != playerColor) {
      return;
    }

    if (_piece.pieceColor == playerColor) {
      selectPiece(_piece);
    } else if (currSelectedPiece != null) {
      if (currSelectedPiece.capture(_piece) && !gameState.isPlayerAi()) {
        scoreLabel.updateScore(unitValues[_piece.unitType]);
      }
      deselect();
    } else {
      deselect();
    }
  });

  mouseClick((_mousePos) => {
    if (gameState.currentPlayerColor() != playerColor) {
      return;
    }

    const mousePos = mouseWorldPos();
    const boardPos = getBoardPos(mousePos);
    const clickedObj = getPieceFromBoard(boardPos);

    if (clickedObj != null && clickedObj == "*") {
      if (currSelectedPiece != null) {
        currSelectedPiece.go(boardPos);
      }
    }
  });

  gameState.board = generateChessBoard(BOARD_ROW, BOARD_COLUMN);

  add([sprite("white_and_black", { width: SPRITE_SIZE * gameState.board[0].length, height: SPRITE_SIZE * gameState.board.length, tiled: true }), pos(0, SPRITE_SIZE), layer("bg")]);

  let currSelectedPiece = null;
  const topBar = add([rect(width(), 64), pos(0, 0), color(15, 15, 15), outline(3), fixed(), z(15), layer("ui")]);
  const currentPlayingLabel = add([text("Player: " + gameState.currentPlayerColor()), z(15), fixed(), layer("ui"), scale(0.5), pos(0, 0)]);
  const timeLabel = add([text("Time: "), layer("ui"), fixed(), scale(0.5), z(15), pos(350, 0)]);
  const scoreLabel = add([text("Score: 0"), layer("ui"), scale(0.5), fixed(), z(15), pos(width() - 350, 0),
  { val: 0, updateScore: function (_val) { score += _val; this.text = "Score: " + score } }]);


  addLevel(gameState.board, {
    width: SPRITE_SIZE,
    height: SPRITE_SIZE,
    pos: vec2(0, SPRITE_SIZE),
    /*
    "*": () => getBoardComponents("white"),
    "-": () => getBoardComponents("black"),
    "9": () => getBoardComponents("upLeft"),
    "7": () => getBoardComponents("upRight"),
    "1": () => getBoardComponents("bottomLeft"),
    "3": () => getBoardComponents("bottomRight"),
    "s": () => getBoardComponents("topBlack"),
    "d": () => getBoardComponents("topWhite"),
    "x": () => getBoardComponents("bottomBlack"),
    "c": () => getBoardComponents("bottomWhite"), 
    */
    "1": () => getPieceComponents(colorTypes.white, unitTypes.king),
    "2": () => getPieceComponents(colorTypes.white, unitTypes.queen),
    "3": () => getPieceComponents(colorTypes.white, unitTypes.knight),
    "4": () => getPieceComponents(colorTypes.white, unitTypes.bishop),
    "5": () => getPieceComponents(colorTypes.white, unitTypes.rook),
    "6": () => getPieceComponents(colorTypes.white, unitTypes.pawn),
    "q": () => getPieceComponents(colorTypes.black, unitTypes.king),
    "w": () => getPieceComponents(colorTypes.black, unitTypes.queen),
    "e": () => getPieceComponents(colorTypes.black, unitTypes.knight),
    "r": () => getPieceComponents(colorTypes.black, unitTypes.bishop),
    "t": () => getPieceComponents(colorTypes.black, unitTypes.rook),
    "y": () => getPieceComponents(colorTypes.black, unitTypes.pawn),
    "a": () => getPieceComponents(colorTypes.light, unitTypes.king),
    "s": () => getPieceComponents(colorTypes.light, unitTypes.queen),
    "d": () => getPieceComponents(colorTypes.light, unitTypes.knight),
    "f": () => getPieceComponents(colorTypes.light, unitTypes.bishop),
    "g": () => getPieceComponents(colorTypes.light, unitTypes.rook),
    "h": () => getPieceComponents(colorTypes.light, unitTypes.pawn),
    "z": () => getPieceComponents(colorTypes.dark, unitTypes.king),
    "x": () => getPieceComponents(colorTypes.dark, unitTypes.queen),
    "c": () => getPieceComponents(colorTypes.dark, unitTypes.knight),
    "v": () => getPieceComponents(colorTypes.dark, unitTypes.bishop),
    "b": () => getPieceComponents(colorTypes.dark, unitTypes.rook),
    "n": () => getPieceComponents(colorTypes.dark, unitTypes.pawn),
  });

  gameState.startTimer();

  let lastAiMoveTime = time();

  const camera = add([pos(center()), "camera", { updateCam: function () { camPos(this.pos); } }]);
  const cameraSpeed = 16;

  keyDown("up", () => {
    camera.pos = camera.pos.add(UP.scale(cameraSpeed));

    if (camera.pos.y <= (height() / 2)) {
      camera.pos = vec2(camera.pos.x, height() / 2);
    }
  });

  keyDown("down", () => {
    camera.pos = camera.pos.add(DOWN.scale(cameraSpeed));

    if (camera.pos.y >= (BOARD_HEIGHT - (height() / 2))) {
      camera.pos = vec2(camera.pos.x, BOARD_HEIGHT - (height() / 2));
    }
  });

  keyDown("right", () => {
    camera.pos = camera.pos.add(RIGHT.scale(cameraSpeed));

    if (camera.pos.x >= (BOARD_WIDTH - (width() / 2))) {
      camera.pos = vec2(BOARD_WIDTH - (width() / 2), camera.pos.y);
    }
  });

  keyDown("left", () => {
    camera.pos = camera.pos.add(LEFT.scale(cameraSpeed));

    if (camera.pos.x <= (width() / 2)) {
      camera.pos = vec2(width() / 2, camera.pos.y);
    }
  });

  action(() => {
    checkIsGameFinished();

    if (camera.updateCam != undefined) {
      camera.updateCam();
    }

    if (gameState.turnStartTime != null) {
      timeLabel.text = "Time: " + Math.round(gameState.turnDuration - (time() - gameState.turnStartTime));
    } else {
      timeLabel.text = "Time: " + gameState.turnDuration;
    }

    if (gameState.isPlayerAi() && (time() - lastAiMoveTime) > 1) {
      moveAi();

      lastAiMoveTime = time();
    }
  });
});

scene("menu", () => {

  add([sprite("white_and_black", { width: width(), height: height(), tiled: true }), layer("bg")]);
  add([text("Chess XLarge"), pos(center().x, center().y - 100), origin("center"), layer("ui")]);

  const buttonPos = vec2(center().x, center().y + 100);
  add([rect(width() - width() / 4, 120), origin("center"), area(), pos(buttonPos), outline(4), layer("ui"), "button"]);
  add([text("Start"), pos(buttonPos), origin("center"), layer("ui")]);

  clicks("button", (btn) => { go("game") });
});

scene("score", () => {
  add([sprite("white_and_black", { width: width(), height: height(), tiled: true }), layer("bg")]);

  const box = add([rect(width() - width() / 4, 160), origin("center"), area(), pos(center().x, center().y - 100), outline(1), layer("ui")]);
  add([text("Thanks for playing the game"), scale(0.8), pos(box.pos.x, box.pos.y - 50), origin("center"), layer("ui")]);
  add([text("Your score: " + score), scale(0.7), pos(box.pos.x, box.pos.y + 10), origin("center"), layer("ui")]);

  const buttonPos = vec2(center().x, center().y + 100);
  add([rect(width() - width() / 4, 120), origin("center"), area(), pos(buttonPos), outline(4), layer("ui"), "button"]);
  add([text("Restart"), pos(buttonPos), origin("center"), layer("ui")]);

  clicks("button", (btn) => { go("game") });
});

go("menu");

