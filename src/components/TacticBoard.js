import React, { useEffect, useState } from "react";
import {
  getSideToPlayFromFen,
  makeMove,
  getPossibleMoves,
  validateMoveOnClick,
} from "../utils/chessTactics";
import { Chessboard } from "react-chessboard";

function TacticBoard({ tactic, onSolve, onCorrect, onIncorrect, boardWidth }) {
  const [fen, setFen] = useState(tactic.fen);
  const [solution, setSolution] = useState([]);
  const [moveFrom, setMoveFrom] = useState("");
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const [piece, setPiece] = useState("");

  useEffect(() => {
    setSolution(tactic.solution);
    setTimeout(() => {
      const next = makeMove(tactic.fen, tactic.blunderMove);
      if (next) {
        setFen(next.fen);
      }
    }, 700);
  }, [tactic.blunderMove, tactic.fen, tactic.solution]);

  console.log(solution);

  function getMoveOptions(square) {
    if (optionSquares !== {}) {
      setOptionSquares({});
    }
    const moves = getPossibleMoves(fen, square);

    if (moves.length === 0) {
      return;
    }

    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
      return move;
    });
    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };
    setOptionSquares(newSquares);
  }

  /*function makeRandomMove() {
    const possibleMoves = game.moves();
    if (game.game_over() || game.in_draw() || possibleMoves.length === 0)
      return; // exit if the game is over
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    safeGameMutate((game) => {
      game.move(possibleMoves[randomIndex]);
    });
  }*/

  function onSquareClick(square) {
    const currentPiece = piece.substring(1);
    const currentMove = `${currentPiece}${square}`;

    setRightClickedSquares({});

    function resetFirstMove(square) {
      setMoveFrom(square);
      getMoveOptions(square);
    }

    // from square
    if (!moveFrom) {
      resetFirstMove(square);
      return;
    }

    // attempt to make move
    let data = {
      from: moveFrom,
      to: square,
      promotion: "q",
    };

    const next = validateMoveOnClick(fen, data, solution);

    if (next) {
      setFen(next.fen);
      setSolution(next.solution);

      if (next.solution.length > 0) {
        onCorrect();

        const autoNext = validateMoveOnClick(
          next.fen,
          next.solution[0],
          next.solution
        );

        if (autoNext) {
          setFen(autoNext.fen);
          setSolution(autoNext.solution);
        }
      } else {
        setFen("");

        onSolve();
      }
    } else if (data.from !== data.to && currentMove !== solution[0]) {
      onIncorrect();
      setMoveFrom("");
      setOptionSquares({});
    }

    // if invalid, setMoveFrom and getMoveOptions
    if (next === null) {
      setMoveFrom("");
      setOptionSquares({});
      return;
    }

    //setTimeout(makeRandomMove, 300);
    setMoveFrom("");
    setOptionSquares({});
  }

  function onSquareRightClick(square) {
    const colour = "rgba(0, 0, 255, 0.4)";
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] &&
        rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    });
  }

  return (
    <Chessboard
      id="tacticBoard"
      animationDuration={300}
      arePiecesDraggable={false}
      boardWidth={boardWidth}
      onPieceClick={(piece) => {
        setPiece(piece);
      }}
      boardOrientation={
        getSideToPlayFromFen(tactic.fen) === "b" ? "white" : "black"
      }
      position={fen}
      onSquareClick={onSquareClick}
      onSquareRightClick={onSquareRightClick}
      customBoardStyle={{
        borderRadius: "4px",
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
      }}
      customSquareStyles={{
        ...optionSquares,
        ...rightClickedSquares,
      }}
    />
  );
}

export default TacticBoard;
