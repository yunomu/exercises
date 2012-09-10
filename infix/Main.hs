module Main where

infixr 1 <->

(<->) :: Num a => a -> a -> a
a <-> b = a - b

