import Control.Applicative hiding (empty)
import System.IO

import Stack4

ope :: (Int -> Int -> Int) -> Stack Int -> StackResult Int
ope f = evalStack $ f <$> pop <*> pop >>= push

calcError :: Stack Int -> String -> IO ()
calcError stack msg = do
    putStr "ERROR: "
    putStrLn msg
    input stack

proc :: Stack Int -> String -> IO ()
proc s xs
    | xs == ""  = input s
    | xs == "p" = display
    | xs == "c" = clear
    | xs == "q" = quit
    | xs == "+" = calc (+)
    | xs == "-" = calc (-)
    | xs == "*" = calc (*)
    | xs == "/" = calc div
    | otherwise = store
  where
    calc :: (Int -> Int -> Int) -> IO ()
    calc f = either (calcError s) input $ ope f s

    display :: IO ()
    display = either (calcError s) display' $ peek' s
      where
        display' :: Show a => Stack a -> IO ()
        display' v = do
            print $ head v
            input s

        peek' :: Stack a -> StackResult a
        peek' = evalStack peek

    store :: IO ()
    store = either (calcError s) input $ evalStack (push $ read xs) s

    quit :: IO ()
    quit = putStrLn "bye v(^n^)v"

    clear :: IO ()
    clear = do
        putStrLn "clear."
        input empty

prompt :: String -> IO ()
prompt p = do
    putStr p
    hFlush stdout

input :: Stack Int -> IO ()
input s = do
    prompt "> "
    xs <- getLine
    proc s xs

main :: IO ()
main = input empty

