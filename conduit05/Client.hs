{-# LANGUAGE OverloadedStrings #-}
import Control.Monad.IO.Class
import Data.Conduit
import qualified Data.Conduit.List as CL
import Data.Conduit.Network
import Data.ByteString.Char8 ()

main :: IO ()
main = runTCPClient (ClientSettings 4000 "localhost") client

client :: Application IO
client src sink =
    src $$ conduit =$ sink
  where
    conduit = do
        yield "hello"
        dat <- await
        liftIO $ print dat

        yield "world"
        dat2 <- await
        liftIO $ print dat2

        yield "goodbye"
        dat3 <- await
        liftIO $ print dat3

