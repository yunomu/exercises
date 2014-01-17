module Main where

import Data.IORef
import System.IO.Streams

main :: IO ()
main = do
    gen <- g 3
    i <- makeInputStream gen
    o <- makeOutputStream $ maybe (return ()) print
    i `connect` o
  where
    g n = do
        ref <- newIORef n
        return $ f ref
    f ref = do
        m <- readIORef ref
        if m == 0
            then return Nothing
            else do
                writeIORef ref (m - 1)
                return $ Just "a"
