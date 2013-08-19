module Player.Human
    ( HumanPlayer
    , initHumanPlayer
    ) where

import Control.Applicative hiding (many)
import Data.Tuple (swap)
import Data.Void (Void)
import Text.Parsec

import Game
import Player

type HumanPlayer = Player Void

initHumanPlayer :: Turn -> HumanPlayer
initHumanPlayer t = Player t humanPlay undefined

humanPlay :: Board -> HumanPlayer -> IO (Maybe Pos, HumanPlayer)
humanPlay b player = do
    putStr "x y = ? "
    str <- getLine
    either
        (const $ humanPlay b player)
        puttable'
        (parse p "" str)
  where
    p = fmap swap $ (,) <$> num <*> num
    num = (+1) . read <$> (spaces *> many1 digit)
    puttable' pos
        | puttable b s pos = return (Just pos, player)
        | otherwise        = humanPlay b player
    s = stone $ playerTurn player
