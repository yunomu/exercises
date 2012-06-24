import System.IO

import Stack3

ope :: Stack Int -> (Int -> Int -> Int) -> Stack Int
ope s f = evalStack s $ do
    v1 <- pop
    v2 <- pop
    push $ f v1 v2

calcError :: Stack Int -> IO ()
calcError s = do
    putStrLn "ERROR."
    input s

display :: Stack Int -> IO ()
display s = maybe (calcError s) display' $ peek' s
  where
    display' v = do
        putValLn v
        input s

putValLn :: Show a => a -> IO ()
putValLn = putStrLn . show

quit :: IO ()
quit = putStrLn "bye v(^n^)v"

calc :: Stack Int -> (Int -> Int -> Int) -> IO ()
calc s f = input $ ope s f

clear :: IO ()
clear = do
    putStrLn "clear."
    input empty

store :: Stack Int -> String -> IO ()
store s xs = input $ evalStack s (push $ read xs)

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

