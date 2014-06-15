{-# LANGUAGE OverloadedStrings #-}

module Main where

import Data.Maybe
import Data.Text (Text)
import qualified Data.Text.IO as T
import Text.MeCab

main :: IO ()
main = do
    version >>= print
    mecab <- new2 "mecab"
    parse mecab t >>= T.putStrLn
    getTheta mecab >>= print
    nodes <- parseToNodes mecab t
    mapM print nodes
    print $ length nodes
    nBestNext mecab >>= T.putStrLn . fromMaybe "(Nothing)"
  where
    t :: Text
    t = "明日は晴れるでしょう"
