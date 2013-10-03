module Main where

infixr 9 <->

(<->) :: Num a => a -> a -> a
a <-> b = a - b

