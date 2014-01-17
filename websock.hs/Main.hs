module Main where

import Control.Concurrent (threadDelay)
import Control.Monad.IO.Class (liftIO)
import Network.WebSockets (Connection, Message(..), DataMessage(..))
import qualified Network.WebSockets as WS
import System.IO.Streams

messageIn :: Connection -> IO (InputStream Message)
messageIn = fromGenerator . g
  where
    g con = do
        msg <- liftIO $ WS.receive con
        yield msg
        g con

main :: IO ()
main = WS.runClient "localhost" 9222 "/devtools/page/D25A0D41-90FA-C0BE-F7AD-C4828638F203" $ \con -> do
    WS.send con (DataMessage $ Binary "{id: 1, method: \"Timeline.start\"}")
    threadDelay 5000000
    o <- makeOutputStream $ maybe (return ()) print
    i <- messageIn con
    i `connect` o
