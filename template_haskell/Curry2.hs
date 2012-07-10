{-# LANGUAGE TemplateHaskell #-}
module Curry2 where

import Language.Haskell.TH

import THex

mapM ncurry' [2..62]

