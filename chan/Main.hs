import Control.Concurrent

main :: IO ()
main = do
    ch <- newChan
    forkIO $ do
        threadDelay 3000000
        writeChan ch 12
    putStrLn "waiting..."
    r <- readChan ch
    print r
