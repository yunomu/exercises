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
import Data.Conduit.Attoparsec
import Network.HTTP.Conduit

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
    => Sink ByteString m ()
printList = do
    str1 <- takeField
    liftIO $ forkIO $ BC.putStrLn str1
    printList

ignore :: (MonadBaseControl IO m) => ParseError -> m ()
ignore _ = return ()

main :: IO ()
main = runResourceT $ do
--    src0 <- curl "http://localhost:8080/"
--    printList src0
    E.handle ignore $ CB.sourceFile "index.html" $$ printList

