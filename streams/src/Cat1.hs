module Main where

import System.IO.Streams

main :: IO ()
main = stdin `connect` stdout
