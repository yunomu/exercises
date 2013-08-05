{-# LANGUAGE TemplateHaskell #-}
module Main where

import Control.Lens
import Data.Map (Map)
import qualified Data.Map as Map
import Data.Text (Text)
import qualified Data.Text as T

data Music = Music
    { _title :: Text
    , _count :: Int
    }
  deriving (Show)
makeLenses ''Music

main :: IO ()
main = do
    let a = Music "soldier game" 0
    print a
    print $ a&count %~ (+1)
    let m = Map.insert 2 a Map.empty
    print m
    print $ Map.adjust (&count %~ (+1)) 2 m
    print $ a^.count
    print $ a&count .~ 427
             &title .~ "Snow halation"
