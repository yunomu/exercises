{-# LANGUAGE GeneralizedNewtypeDeriving #-}

module Main where

newtype UserId = UserIdC { toInt :: Int }
  deriving (Show, Num)

superUser :: UserId
superUser = 0
