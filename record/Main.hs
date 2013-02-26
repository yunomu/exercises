{-# LANGUAGE TemplateHaskell #-}

import TH

data Test = T
    { a :: Int
    , b :: String
    }
  deriving (Show)

main :: IO ()
main = do
    print test
    print $ $(upd 'a) succ test
  where
    test = T 1 "abc"
