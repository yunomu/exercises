module Player.SimpleAI
    ( SimpleAIPlayer
    , initSimpleAIPlayer
    , simpleAIEval
    ) where

import Data.List (maximumBy)
import Data.Matrix
import Data.Void (Void)

import Game
import Player

type SimpleAIPlayer = Player Void

initSimpleAIPlayer :: Turn -> SimpleAIPlayer
initSimpleAIPlayer t = Player t simpleAIPlay undefined

simpleAIPlay :: Board -> SimpleAIPlayer -> IO (Maybe Pos, SimpleAIPlayer)
simpleAIPlay board player
    = return (Just $ maximumBy f (findPuttables board (stone $ playerTurn player)), player)
  where
    f a b = (simpleAIEval ! a) `compare` (simpleAIEval ! b)

simpleAIEval :: Matrix Int
simpleAIEval = fromLists
    [ [ 0,   0,   0,  0,  0,  0,  0,   0,   0, 0]
    , [ 0, 100, -50, 35, 30, 30, 35, -50, 100, 0]
    , [ 0, -50, -70, 10, 15, 15, 10, -70, -50, 0]
    , [ 0,  35,  10, 20, 25, 25, 20,  10,  35, 0]
    , [ 0,  30,  15, 25, 50, 50, 25,  15,  30, 0]
    , [ 0,  30,  15, 25, 50, 50, 25,  15,  30, 0]
    , [ 0,  35,  10, 20, 25, 25, 20,  10,  35, 0]
    , [ 0, -50, -70, 10, 15, 15, 10, -70, -50, 0]
    , [ 0, 100, -50, 35, 30, 30, 35, -50, 100, 0]
    , [ 0,   0,   0,  0,  0,  0,  0,   0,   0, 0]
    ]
