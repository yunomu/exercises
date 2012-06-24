import Control.Applicative hiding (empty)
import System.IO

import Stack4

ope :: (Int -> Int -> Int) -> Stack Int -> StackResult Int
ope f = evalStack $ push <$> (f <$> pop <*> pop)

calcError :: (String, Stack Int) -> IO ()
calcError (msg, stack) = do
    putStr "ERROR: "
    putStrLn msg
    input stack

display :: Stack Int -> IO ()
display s = either calcError display' $ peek' s
  where
    display' :: Show a => Stack a -> IO ()
    display' v = do
        print $ head v
        input s

    peek' :: Stack a -> StackResult a
    peek' = evalStack peek

quit :: IO ()
quit = putStrLn "bye v(^n^)v"

calc :: Stack Int -> (Int -> Int -> Int) -> IO ()
calc s f = either calcError input $ ope f s

clear :: IO ()
clear = do
    putStrLn "clear."
    input empty

store :: Stack Int -> String -> IO ()
store s xs = either calcError input $ evalStack (push $ read xs) s

proc :: Stack Int -> String -> IO ()
proc s xs
    | xs == ""  = input s
    | xs == "p" = display s
    | xs == "c" = clear
    | xs == "q" = quit
    | xs == "+" = calc s (+)
    | xs == "-" = calc s (-)
    | xs == "*" = calc s (*)
    | xs == "/" = calc s div
    | otherwise = store s xs

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

