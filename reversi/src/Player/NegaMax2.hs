module Player.NegaMax2
    ( NegaMaxPlayer
    , Depth
    , initNegaMaxPlayer2
    ) where

import Control.Applicative
import Control.Monad
import Data.List
import Data.Matrix
import Data.Tuple (swap)

import Game
import Player
import Player.SimpleAI (simpleAIEval)

type Depth = Int

type NegaMaxPlayer = Player Depth

initNegaMaxPlayer2 :: Turn -> Depth -> NegaMaxPlayer
initNegaMaxPlayer2 t d = Player t negaMaxPlay d

boardScoreEvaluator :: Turn -> Evaluator 
boardScoreEvaluator t = Evaluator t 0 boardWillPut boardEvalScore

boardWillPut :: Evaluator -> Board -> Pos -> Stone -> Evaluator
boardWillPut e _ p s = e { evalCurrentScore = v }
  where
    v | s == stone (evalTurn e) = evalCurrentScore e + (simpleAIEval ! p)
      | otherwise               = evalCurrentScore e - (simpleAIEval ! p)

boardEvalScore :: Evaluator -> Board -> Turn -> Score
boardEvalScore e _ t
    | t == evalTurn e = evalCurrentScore e
    | otherwise       = 0 - evalCurrentScore e

negaMaxSearcher :: Searcher
negaMaxSearcher b 0 t e
    = return (Nothing, evalScore e b t)
negaMaxSearcher b d t e
    | null ps   = return (Nothing, 0 - evalScore e b t)
    | otherwise = maximumBy f <$> (forM ps $ \p -> do
        let e' = willPut e b p s
        let b' = put b s p
        sc <- snd <$> negaMaxSearcher b' (d - 1) (flipTurn t) e'
        return (Just p, -sc)
        )
  where
    s = stone t
    ps = findPuttables b s
    f r1 r2 = snd r1 `compare` snd r2

depth :: NegaMaxPlayer -> Depth
depth p = playerState p

negaMaxPlay :: Board -> NegaMaxPlayer -> IO (Maybe Pos, NegaMaxPlayer)
negaMaxPlay b p =
    swap . (,) p . fst <$> negaMaxSearcher b (depth p) t (boardScoreEvaluator t)
  where
    t = playerTurn p
