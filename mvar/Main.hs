module Main where

import Control.Concurrent
import Control.Exception

sleep :: Int -> IO Int
sleep n = do
    threadDelay $ n * 1000000
    return n

failure :: IO a
failure = fail "failure"

type Future a = MVar (Either SomeException a)

fork :: IO a -> IO (Future a)
fork proc = do
    v <- newEmptyMVar
    forkIO $ try proc >>= putMVar v
    return v

join :: Future a -> IO a
join mvar = takeMVar mvar >>= either throw return

main :: IO ()
main = do
    (r1:r2:rs) <-
        sequence $ map fork [sleep 1, sleep 2, sleep 3, failure, sleep 5]
    join r1 >>= print
    join r2 >>= print
    sequence (map join rs) >>= print
