module Player.MinMax
    ( Depth
    , MinMaxPlayer
    , initMinMaxPlayer
    ) where

import Data.List
import Data.Matrix

import Game
import Player
import Player.SimpleAI (simpleAIEval)

type Depth = Int

type MinMaxPlayer = Player Depth

depth :: MinMaxPlayer -> Depth
depth p = playerState p

initMinMaxPlayer :: Turn -> Depth -> MinMaxPlayer
initMinMaxPlayer t d = Player t minMaxPlay d

minMaxPlay :: Board -> MinMaxPlayer -> IO (Maybe Pos, MinMaxPlayer)
minMaxPlay b player = return (fst $ evalMyTurn b player (depth player) 0, player)

evalMyTurn :: Board -> MinMaxPlayer -> Depth -> Score -> (Maybe Pos, Score)
evalMyTurn _ _ 0 score = (Nothing, score)
evalMyTurn board player d score
    | null ps   = (Nothing, score)
    | otherwise = maximumBy f $ map g ps
  where
    s = stone $ playerTurn player
    ps = findPuttables board s
    b' = put board s
    f r1 r2 = snd r1 `compare` snd r2
    g p = (Just p, sc)
      where
        (_, sc) = evalEnemyTurn (b' p) player (d - 1) (score + simpleAIEval ! p)

evalEnemyTurn :: Board -> Player Depth -> Depth -> Score -> (Maybe Pos, Score)
evalEnemyTurn _ _ 0 score = (Nothing, score)
evalEnemyTurn board player d score
    | null ps   = (Nothing, score)
    | otherwise = minimumBy f $ map g ps
  where
    s = stone $ playerTurn player
    ps = findPuttables board s
    b' = put board s
    f r1 r2 = snd r1 `compare` snd r2
    g p = (Just p, sc)
      where
        (_, sc) = evalMyTurn (b' p) player (d - 1) (score - simpleAIEval ! p)
