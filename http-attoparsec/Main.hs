{-# LANGUAGE OverloadedStrings, FlexibleContexts #-}
module Main where

import Control.Applicative
import Control.Concurrent
import qualified Control.Exception.Lifted as E
import Control.Monad.IO.Class
import Control.Monad.Trans.Control
import Control.Monad.Trans.Resource
import Data.Attoparsec.ByteString
import qualified Data.Attoparsec.ByteString.Char8 as AC
import Data.ByteString
import qualified Data.ByteString.Char8 as BC
import Data.Conduit
import qualified Data.Conduit.Binary as CB
import qualified Data.Conduit.List as CL
import Data.Conduit.Attoparsec
import Network.HTTP.Conduit
import Control.Concurrent.Event

curl :: (MonadBaseControl IO m, MonadResource m) =>
    String -> m (ResumableSource m ByteString)
curl url = do
    request <- liftIO $ parseUrl url
    manager <- liftIO $ newManager def
    responseBody <$> http request manager

takeField :: (Monad m, MonadThrow m) => GLSink ByteString m ByteString
takeField = sinkParser field
  where
    field :: Parser ByteString
    field = AC.takeWhile (/= ',') <* AC.anyChar

getIntList :: (MonadBaseControl IO m, MonadThrow m) =>
    ResumableSource m ByteString ->
    m [Int]
getIntList src = E.handle handler $ do
    (src1, str1) <- src $$++ takeField
    let v = read $ BC.unpack str1
    if v < 10
      then getIntList src1
      else (v:) <$> getIntList src1
  where
    handler :: (MonadBaseControl IO m) => ParseError -> m [a]
    handler _ = return []

printList :: (MonadBaseControl IO m, MonadResource m)
    => ResumableSource m ByteString -> m ()
printList src = printList' src []
  where
    printList' src0 es = do
        (src1, field) <- src0 $$++ takeField
        e <- liftIO $ fork $ BC.putStrLn field
        let es' = e:es
        E.handle (ignore es') $ printList' src1 es'

fork :: IO () -> IO Event
fork proc = do
    event <- new
    forkIO $ withEvent event proc
    return event

withEvent :: Event -> IO a -> IO a
withEvent event proc = E.finally proc $ set event

ignore :: (MonadResource m, MonadBaseControl IO m)
    => [Event] -> ParseError -> m ()
ignore es _ = liftIO $ mapM_ wait es

main :: IO ()
main = runResourceT $ do
--    src0 <- curl "http://localhost:8080/"
    (src0, _) <- CB.sourceFile "index.html" $$+ CL.take 0
    printList src0

