import Stack
import Parser

ope :: Stack Int -> (Int -> Int -> Int) -> Stack Int
ope s f = push s2 (f v1 v2)
          where
            (v1, s1) = pop s
            (v2, s2) = pop s1

calc :: Stack Int -> String -> Stack Int
calc s xs
    | xs == "+" = ope s (+)
    | xs == "-" = ope s (-)
    | xs == "*" = ope s (*)
    | xs == "/" = ope s div
    | otherwise = case parse int xs of
                    [(v, "")] -> push s v
                    _         -> error "invalid input."

proc :: Stack Int -> String -> IO ()
proc s xs
    | xs == "p" = do (putStrLn.show.peek) s
                     input s
    | xs == "q" = putStrLn "bye v(^n^)v"
    | otherwise = input (calc s xs)

input :: Stack Int -> IO ()
input s = do putStr " > "
             xs <- getLine
             proc s xs

main :: IO ()
main = input empty

