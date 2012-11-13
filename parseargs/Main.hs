module Main where

import System.Console.ParseArgs

options :: [Arg Int]
options =
    [ Arg 0 (Just 'f') (Just "first") Nothing "first"
    , Arg 1 Nothing Nothing (argDataRequired "abc" ArgtypeInt) "nothing"
    ]

main :: IO ()
main = do
    a <- parseArgsIO ArgsComplete options
    putStrLn $ "progName: " ++ argsProgName a
    print (getRequiredArg a 1 :: Int)
    putStrLn $ argsUsage a
    return ()
