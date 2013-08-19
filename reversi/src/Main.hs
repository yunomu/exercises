module Main where

import Game
import Player
import Player.Human
import Player.SimpleAI
import Player.MinMax
import Player.NegaMax
import Player.NegaMax2

loop :: Player a -> Player b -> Board -> Turn -> IO (Board, Turn)
loop a b board t
    | puttableSomewhere board (stone t) = do
        print board
        (mpos, (a', b')) <- play'
        case mpos of
            Nothing  -> return (board, flipTurn t)
            Just pos ->
                loop a' b' (put board (stone t) pos) $ flipTurn t
    | otherwise = return (board, flipTurn t)
  where
    play'
        | t == TurnBlack = do
            (mp, a') <- play board a
            return (mp, (a', b))
        | t == TurnWhite = do
            (mp, b') <- play board b
            return (mp, (a, b'))
        | otherwise      = fail "not reached"

main :: IO ()
main = do
    (b, t) <- loop black white setup TurnBlack
    print b
    putStr "BLACK = "
    let nb = countStone b Black
    print nb
    putStr "WHITE = "
    let nw = countStone b White
    print nw
    judge t nb nw
  where
--    black = initHumanPlayer TurnBlack
--    black = initMinMaxPlayer TurnBlack 3
--    black = initNegaMaxPlayer TurnBlack 3
    black = initNegaMaxPlayer2 TurnBlack 3
    white = initSimpleAIPlayer TurnWhite
    judge t b w
        | b + w == 64 = judge' b w
        | otherwise   = mate t
    judge' b w
        | b > w     = putStrLn "BLACK win!"
        | b < w     = putStrLn "WHITE win!"
        | otherwise = putStrLn "DRAW"
    mate t
        | t == TurnBlack = putStrLn "BLACK win!"
        | t == TurnWhite = putStrLn "WHITE win!"
        | otherwise      = error "not reached"
