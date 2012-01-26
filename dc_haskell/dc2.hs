import Stack2
import Parser

ope :: Stack Int -> (Int -> Int -> Int) -> Maybe (Stack Int)
ope s f = do (v1, s1) <- pop s
             (v2, s2) <- pop s1
             return (push s2 (f v1 v2))

calcError :: Stack Int -> IO ()
calcError s = do putStrLn "ERROR."
                 input s

display :: Stack Int -> String -> IO ()
display s xs = maybe (calcError empty) display' (peek s)
               where
                 display' = \v -> do (putStrLn.show) v
                                     input s

quit :: IO ()
quit = putStrLn "bye v(^n^)v"

calc :: Stack Int -> (Int -> Int -> Int) -> IO ()
calc s f = maybe (calcError s) input (ope s f)

clear :: IO ()
clear = do putStrLn "clear."
           input empty

readInt :: String -> Maybe Int
readInt str = case parse int str of
                [(v, "")] -> Just v
                _         -> Nothing

store :: Stack Int -> String -> IO ()
store s xs = maybe (calcError s) store' (readInt xs)
             where
               store' = \v -> input (push s v)

proc :: Stack Int -> String -> IO ()
proc s xs
    | xs == ""  = input s
    | xs == "p" = display s xs
    | xs == "c" = clear
    | xs == "q" = quit
    | xs == "+" = calc s (+)
    | xs == "-" = calc s (-)
    | xs == "*" = calc s (*)
    | xs == "/" = calc s div
    | otherwise = store s xs

input :: Stack Int -> IO ()
input s = do putStr "> "
             xs <- getLine
             proc s xs

main :: IO ()
main = input empty

