{-# LANGUAGE TypeOperators, DataKinds #-}

module Main where

import Control.Effect

pop :: Effect (State [Int] :+ Lift IO :+ l) Int
pop = do
    (a:as) <- get
    put as
    lift $ putStrLn "pop"
    return a

calc :: Effect (Lift IO :+ l) [Int]
calc = execState [1, 2] $ do
    a <- pop
    b <- pop
    modify ((a + b):)

main :: IO ()
main = runLift $ calc >>= lift . print
