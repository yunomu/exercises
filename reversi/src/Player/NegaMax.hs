module Player.NegaMax
    ( NegaMaxPlayer
    , Depth
    , initNegaMaxPlayer
    ) where

import Data.List
import Data.Matrix

import Game
import Player
import Player.SimpleAI (simpleAIEval)

type Depth = Int

type NegaMaxPlayer = Player Depth

initNegaMaxPlayer :: Turn -> Depth -> NegaMaxPlayer
initNegaMaxPlayer t d = Player t negaMaxPlay d

depth :: NegaMaxPlayer -> Depth
depth p = playerState p

negaMaxPlay :: Board -> NegaMaxPlayer -> IO (Maybe Pos, NegaMaxPlayer)
negaMaxPlay b player = return (fst $ eval b player (depth player) (playerTurn player) 0, player)

eval :: Board -> NegaMaxPlayer -> Depth -> Turn -> Score -> (Maybe Pos, Score)
eval _ player 0 t score
    | playerTurn player == t = (Nothing, score)
    | otherwise        = (Nothing, -score)
eval board player d t score
    | null ps   = (Nothing, score)
    | otherwise = maximumBy f $ map g ps
  where
    s = stone $ playerTurn player
    ps = findPuttables board s
    b' = put board s
    f r1 r2 = snd r1 `compare` snd r2
    g p = (Just p, -sc)
      where
        (_, sc) = eval (b' p) player (d - 1) (flipTurn t) (score + sc')
        sc' | playerTurn player == t = simpleAIEval ! p
            | otherwise        = - simpleAIEval ! p
