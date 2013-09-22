{-# LANGUAGE OverloadedStrings #-}
module Main where

import Control.Monad ((>=>))
import Control.Monad.IO.Class (liftIO)
import Data.ByteString (ByteString)
import Data.ByteString.Char8 ()
import Prelude hiding (lines, read)
import System.IO.Streams

data Member = Member ByteString deriving (Show)

f :: InputStream ByteString -> IO (InputStream Member)
f = fromGenerator . g

g :: InputStream ByteString -> Generator Member ()
g is = do
    ma <- liftIO $ read is
    case ma of
        Nothing -> return ()
        Just a  -> do
            yield (Member a) >> g is

main0 :: IO ()
main0 = withFileAsInput "data.txt" $ lines >=> toList >=> print

main :: IO ()
main = withFileAsInput "data.txt" $ \is -> do
    ls <- lines is
    ma <- read ls
    print ma
    unRead "arisa" ls
    mb <- peek ls
    print mb
    as <- toList ls
    print as
    mc <- read ls
    print mc

main2 :: IO ()
main2 = withFileAsInput "data.txt" $ \is -> do
    ls <- lines is
    ms <- f ls
    toList ms >>= print
