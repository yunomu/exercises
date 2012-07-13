
{-# LANGUAGE OverloadedStrings #-}

--import Control.Monad.IO.Class
import Data.ByteString
import qualified Data.ByteString.Char8 as S8
import Data.Conduit
import qualified Data.Conduit.Binary as CB
import qualified Data.Conduit.List as CL
import Data.Conduit.Network
import Data.ByteString.Char8 ()

main :: IO ()
main = runTCPServer (ServerSettings 5000 HostAny) proxy

takeLine :: Monad m => Sink ByteString m ByteString
takeLine = do
    let linefeed = 10
    bss <- CB.takeWhile (/= linefeed) =$ CL.consume
    CB.drop 1 -- drop the newline
    return $ S8.takeWhile (/= '\r') $ S8.concat bss

getPortHost :: Monad m => Sink ByteString m ClientSettings
getPortHost = do
    port <- takeLine
    host <- takeLine
    return $ ClientSettings (read $ S8.unpack port) (S8.unpack host)

proxy :: Application IO
proxy fromClient0 toClient = do
    (fromClient, clientSettings) <- fromClient0 $$+ getPortHost
    runTCPClient clientSettings (proxyLoop fromClient toClient)

proxyLoop :: Monad m =>
    ResumableSource m ByteString -> Sink ByteString m () -> Application m
proxyLoop fromClient toClient fromServer0 toServer = do
    yield "Connect to server" $$ toClient
    (fromServer, ()) <- fromServer0 $$+ return ()
    loop fromClient fromServer
  where
    loop fromClient fromServer = do
        (fromClient', mbs) <- fromClient $$++ await
        case mbs of
            Nothing -> close fromClient' fromServer
            Just bs -> do
                yield bs $$ toServer
                (fromServer', mbs2) <- fromServer $$++ await
                case mbs2 of
                    Nothing -> do
                        yield "Server close connection" $$ toClient
                        close fromClient' fromServer'
                    Just bs2 -> do
                        yield bs2 $$ toClient
                        loop fromClient' fromServer'

    close x y = do
        x $$+- return ()
        y $$+- return ()

