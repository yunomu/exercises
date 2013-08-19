module Player
    ( Player(..)
    , play
    , Score
    , Evaluator(..)
    , willPut
    , evalScore
    , Searcher
    ) where

import Game

data Player s = Player
    { playerTurn :: Turn
    , playerPlay :: Board -> Player s -> IO (Maybe Pos, Player s)
    , playerState :: s
    }

play :: Board -> Player s -> IO (Maybe Pos, Player s)
play b p = (playerPlay p) b p

type Score = Int

data Evaluator = Evaluator
    { evalTurn :: Turn
    , evalCurrentScore :: Score
    , evalWillPutF :: Evaluator -> Board -> Pos -> Stone -> Evaluator
    , evalScoreF :: Evaluator -> Board -> Turn -> Score
    }

willPut :: Evaluator -> Board -> Pos -> Stone -> Evaluator
willPut e b p s = (evalWillPutF e) e b p s

evalScore :: Evaluator -> Board -> Turn -> Score
evalScore e b t = (evalScoreF e) e b t

type Searcher = Board -> Int -> Turn -> Evaluator -> IO (Maybe Pos, Score)
