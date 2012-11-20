module Main where

import System.Console.ParseArgs

options :: [Arg Int]
options =
    [ Arg 0 (Just 'f') (Just "first") Nothing "first args"
    , Arg 1 (Just 's') (Just "second") (argDataRequired "TEXT" ArgtypeString) "second args"
    , Arg 2 (Just 't') (Just "third") (argDataOptional "FLOAT" ArgtypeFloat) "third args"
    , Arg 3 (Just 'd') (Just "default") (argDataDefaulted "STR" ArgtypeString "dddd") "third args"
    , Arg 4 Nothing Nothing (argDataRequired "abc" ArgtypeInt) "abc value"
    ]

main :: IO ()
main = do
    a <- parseArgsIO ArgsComplete options
    putStrLn $ "progName: " ++ argsProgName a
    print (gotArg a 0)
    print (getArg a 1 :: Maybe String)
    print (getArg a 2 :: Maybe Float)
    print (getArg a 3 :: Maybe String)
    print (getArg a 4 :: Maybe Int)
    putStrLn $ argsUsage a
    return ()
