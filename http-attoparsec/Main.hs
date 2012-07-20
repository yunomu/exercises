{-# LANGUAGE OverloadedStrings, FlexibleContexts #-}
module Main where

import Control.Applicative
import Control.Concurrent
import qualified Control.Exception.Lifted as E
import Control.Failure
import Control.Monad.IO.Class
import Control.Monad.Trans.Control
import Control.Monad.Trans.Resource
import Data.Attoparsec.ByteString
import qualified Data.Attoparsec.ByteString.Char8 as AC
import Data.ByteString
import qualified Data.ByteString.Char8 as BC
import Data.Conduit
import Data.Conduit.Attoparsec
import Network.HTTP.Conduit

curl :: (MonadUnsafeIO m,
         MonadThrow m,
         MonadIO m,
         MonadBaseControl IO m,
         Failure HttpException m) =>
    String -> m (ResumableSource (ResourceT m) ByteString)
curl url = do
    request <- parseUrl url
    withManager $ \manager ->
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

printList :: (MonadIO m, MonadBaseControl IO m, MonadThrow m) =>
    ResumableSource m ByteString -> m ()
printList src = E.handle handler $ do
    (src1, str1) <- src $$++ takeField
    liftIO $ forkIO $ BC.putStrLn str1
    printList src1
  where
    handler :: (MonadBaseControl IO m) => ParseError -> m ()
    handler _ = return ()

main :: IO ()
main = runResourceT $ do
    src0 <- liftIO $ curl "http://localhost:8080/"
    printList src0

