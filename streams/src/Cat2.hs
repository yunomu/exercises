module Main where

import Control.Applicative
import System.IO (stdin, stdout)
import System.IO.Streams hiding (stdin, stdout)

main :: IO ()
main = do
    is <- handleToInputStream stdin
    os <- handleToOutputStream stdout
    is `connect` os
