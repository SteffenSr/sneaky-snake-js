// Welcome to
// __________         __    __  .__                               __
// \______   \_____ _/  |__/  |_|  |   ____   ______ ____ _____  |  | __ ____
//  |    |  _/\__  \\   __\   __\  | _/ __ \ /  ___//    \\__  \ |  |/ // __ \
//  |    |   \ / __ \|  |  |  | |  |_\  ___/ \___ \|   |  \/ __ \|    <\  ___/
//  |________/(______/__|  |__| |____/\_____>______>___|__(______/__|__\\_____>
//
// This file can be a nice home for your Battlesnake logic and helper functions.
//
// To get you started we've included code to prevent your Battlesnake from moving backwards.
// For more info see docs.battlesnake.com

import runServer from "./server.js";

// info is called when you create your Battlesnake on play.battlesnake.com
// and controls your Battlesnake's appearance
// TIP: If you open your Battlesnake URL in a browser you should see this data
function info() {
  console.log("INFO");

  return {
    apiversion: "1",
    author: "sasquatch",
    color: "#6ce6cd",
    head: "nr-rocket",
    tail: "bonhomme",
  };
}

// start is called when your Battlesnake begins a game
function start(gameState) {
  console.log("GAME START");
}

// end is called when your Battlesnake finishes a game
function end(gameState) {
  console.log("GAME OVER\n");
}

// move is called on every turn and returns your next move
// Valid moves are "up", "down", "left", or "right"
// See https://docs.battlesnake.com/api/example-move for available data
function move(gameState) {
  let isMoveSafe = {
    up: true,
    down: true,
    left: true,
    right: true,
  };

  const myHead = gameState.you.body[0];
  const myNeck = gameState.you.body[1];
  const boardWidth = gameState.board.width;
  const boardHeight = gameState.board.height;

  preventMovingBackwards();
  preventOutOfBounds();
  preventCollidingWithItself();
  preventCollidingWithOtherSnakes();
  preventHeadToHeadCollisions();
  moveTowardsFoodVersion1();
  const distanceToFood = logDistanceToFood();

  function logDistanceToFood() {
    const food = gameState.board.food[0];
    const distance = Math.abs(myHead.x - food.x) + Math.abs(myHead.y - food.y);
    return distance;
  }

  // Are there any safe moves left?
  const safeMoves = Object.keys(isMoveSafe).filter((key) => isMoveSafe[key]);
  if (safeMoves.length == 0) {
    console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
    return { move: "down" };
  }

  // Choose a random move from the safe moves
  const nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];

  const gameTurn = `${gameState.turn}`.padEnd(3, " ");
  const nextMovePadded = `${nextMove}`.padEnd(5, " ");
  const distanceToFoodPadded = `${distanceToFood}`.padEnd(2, " ");
  console.log(
    `MOVE ${gameTurn}: ${nextMovePadded} Dist. to food: ${distanceToFoodPadded}. Pos (${myHead.x}, ${myHead.y})`
  );

  return { move: nextMove };

  function preventHeadToHeadCollisions() {
    const opponents = gameState.board.snakes;
    for (let i = 0; i < opponents.length; i++) {
      const opponent = opponents[i];
      const opponentHead = opponent.body[0];

      if (myHead.y === opponentHead.y) {
        if (myHead.x - 1 === opponentHead.x + 1) {
          isMoveSafe.left = false;
        }
        if (myHead.x + 1 === opponentHead.x - 1) {
          isMoveSafe.right = false;
        }
      }
      if (myHead.x === opponentHead.x) {
        if (myHead.y - 1 === opponentHead.y + 1) {
          isMoveSafe.down = false;
        }
        if (myHead.y + 1 === opponentHead.y - 1) {
          isMoveSafe.up = false;
        }
      }
    }
  }

  function moveTowardsFoodVersion1() {
    function cancelOtherMovesBut(move) {
      isMoveSafe.up = false;
      isMoveSafe.down = false;
      isMoveSafe.left = false;
      isMoveSafe.right = false;
      isMoveSafe[move] = true;
    }

    // get the coordinates of the food
    const food = gameState.board.food[0];
    // if food is above battlesnake
    if (food.y > myHead.y) {
      if (isMoveSafe.up) {
        cancelOtherMovesBut("up");
      }
    }
    // if food is below battlesnake
    if (food.y < myHead.y) {
      if (isMoveSafe.down) {
        cancelOtherMovesBut("down");
      }
    }
    // if food is to the left of battlesnake
    if (food.x < myHead.x) {
      if (isMoveSafe.left) {
        cancelOtherMovesBut("left");
      }
    }
    // if food is to the right of battlesnake
    if (food.x > myHead.x) {
      if (isMoveSafe.right) {
        cancelOtherMovesBut("right");
      }
    }
  }

  function preventCollidingWithOtherSnakes() {
    const opponents = gameState.board.snakes;
    for (let i = 0; i < opponents.length; i++) {
      const opponent = opponents[i];
      for (let j = 0; j < opponent.body.length; j++) {
        const bodyPart = opponent.body[j];
        preventHeadToBodypart(bodyPart);
      }
    }
  }

  function preventCollidingWithItself() {
    const myBody = gameState.you.body;
    for (let i = 1; i < myBody.length; i++) {
      const bodyPart = myBody[i];
      preventHeadToBodypart(bodyPart);
      // TODO: Prevent trapping yourself
    }
  }

  function preventHeadToBodypart(bodyPart) {
    // Check if head is next to any body part
    if (myHead.x === bodyPart.x) {
      if (myHead.y + 1 === bodyPart.y) {
        // Head is below body part, don't move up
        isMoveSafe.up = false;
      } else if (myHead.y - 1 === bodyPart.y) {
        // Head is above body part, don't move down
        isMoveSafe.down = false;
      }
    }
    if (myHead.y === bodyPart.y) {
      if (myHead.x - 1 === bodyPart.x) {
        // Head is right of body part, don't move left
        isMoveSafe.left = false;
      } else if (myHead.x + 1 === bodyPart.x) {
        // Head is left of body part, don't move right
        isMoveSafe.right = false;
      }
    }
  }

  function preventMovingBackwards() {
    if (myNeck.x < myHead.x) {
      // Neck is left of head, don't move left
      isMoveSafe.left = false;
    } else if (myNeck.x > myHead.x) {
      // Neck is right of head, don't move right
      isMoveSafe.right = false;
    } else if (myNeck.y < myHead.y) {
      // Neck is below head, don't move down
      isMoveSafe.down = false;
    } else if (myNeck.y > myHead.y) {
      // Neck is above head, don't move up
      isMoveSafe.up = false;
    }
  }

  function preventOutOfBounds() {
    if (myHead.x === 0) {
      // Head is one square from left edge, don't move left
      isMoveSafe.left = false;
    }
    if (myHead.x === boardWidth - 1) {
      // Head is one square from right edge, don't move right
      isMoveSafe.right = false;
    }
    if (myHead.y === 0) {
      // Head is one square from bottom edge, don't move down
      isMoveSafe.down = false;
    }
    if (myHead.y === boardHeight - 1) {
      // Head is one square from top edge, don't move up
      isMoveSafe.up = false;
    }
  }
}

runServer({
  info: info,
  start: start,
  move: move,
  end: end,
});
