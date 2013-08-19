module Game where

import Control.Applicative
import Control.Monad
import qualified Control.Monad.State as State
import Data.Matrix
import Data.Monoid
import qualified Data.Foldable as F

data Stone
    = Empty
    | Black
    | White
    | Wall
  deriving (Eq)

instance Show Stone where
    show Empty = "."
    show Black = "x"
    show White = "o"
    show Wall  = " "

data Turn = TurnBlack | TurnWhite
  deriving (Eq)

type Board = Matrix Stone
type Pos = (Int, Int)
type Motion = Pos -> Pos

setup :: Board
setup = matrix 10 10 f
  where
    f (1, _)  = Wall
    f (10, _) = Wall
    f (_, 1)  = Wall
    f (_, 10) = Wall
    f (5, 5)  = White
    f (6, 6)  = White
    f (5, 6)  = Black
    f (6, 5)  = Black
    f _       = Empty

valid :: Pos -> Bool
valid (px, py) = and
    [ px >= 1
    , px <= 10
    , py >= 1
    , py <= 10
    ]

flipStone :: Stone -> Stone
flipStone Black = White
flipStone White = Black
flipStone _     = error "not reached"

flipTurn :: Turn -> Turn
flipTurn TurnWhite = TurnBlack
flipTurn TurnBlack = TurnWhite

stone :: Turn -> Stone
stone TurnBlack = Black
stone TurnWhite = White

nflip :: Board -> Stone -> Pos -> Motion -> Int
nflip b s pos m
    | not (valid pos)  = 0
    | b ! pos == Empty = c pos
    | otherwise        = 0
  where
    c p = c' p 0
    c' p n
        | b ! mp == Wall        = 0
        | b ! mp == Empty       = 0
        | b ! mp == s           = n
        | b ! mp == flipStone s = c' mp (n + 1)
        | otherwise = error "not reached"
      where
        mp = m p

nflipAll :: Board -> Stone -> Pos -> Int
nflipAll b s pos = sum $ map (nflip b s pos) motions

up :: Motion
up (p1, p2) = (p1, p2 - 1)

down :: Motion
down (p1, p2) = (p1, p2 + 1)

left :: Motion
left (p1, p2) = (p1 - 1, p2)

right :: Motion
right (p1, p2) = (p1 + 1, p2)

motions :: [Motion]
motions = tail $ (.) <$> [id, up, down] <*> [id, left, right]

puttable :: Board -> Stone -> Pos -> Bool
puttable b s pos
    | not (valid pos) = False
    | otherwise       = or $ map (\m -> nflip b s pos m > 0) motions

puttableSomewhere :: Board -> Stone -> Bool
puttableSomewhere b s = or $ puttable b s <$> positions

positions :: [Pos]
positions = (,) <$> [2..9] <*> [2..9]

put :: Board -> Stone -> Pos -> Board
put b s pos
    | not (puttable b s pos) = error "not puttable"
    | otherwise              = flip State.execState b $ do
        State.modify $ setElem s pos
        mapM_ (f pos) motions
  where
    rs = flipStone s
    f p m
        | nflip b s pos m == 0 = return ()
        | otherwise            = g p m
    g p m = when (b ! mp == rs) $ do
        State.modify $ setElem s mp
        g mp m
      where
        mp = m p

countStone :: Board -> Stone -> Int
countStone b s = F.foldr f 0 $ toVector b
  where
    f s' n | s == s'   = n + 1
           | otherwise = n
    toVector m = mconcat $ map (flip getRow m) [1..nrows m]

findPuttables :: Board -> Stone -> [Pos]
findPuttables b s = filter (puttable b s) positions
