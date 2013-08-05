{-# LANGUAGE TemplateHaskell #-}
module Main where

import Control.Lens
import Data.Map
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
    let a = Music "Snow halation" 0
    print a
    print $ a&count %~ (+1)
    let m = insert 2 a empty
    print m
    print $ adjust (&count %~ (+1)) 2 m
    print $ a^.count
    print $ a&count .~ 427
