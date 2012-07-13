{-# LANGUAGE OverloadedStrings #-}

import Data.ByteString
import qualified Data.ByteString.Char8 as S8
import Data.Conduit
import Data.Conduit.Network

app :: Application IO
app src sink = src $$ conduit =$ sink

conduit :: Conduit ByteString IO ByteString
conduit = do
    mbs <- await
    case mbs of
        Nothing -> return ()
        Just bs
            | S8.isPrefixOf "quit" bs -> return ()
            | otherwise -> do
                yield bs
                conduit

main :: IO ()
main = runTCPServer (ServerSettings 4000 HostAny) app

