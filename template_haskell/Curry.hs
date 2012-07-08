{-# LANGUAGE TemplateHaskell #-}
module Curry where

import Language.Haskell.TH

import THex

do
    let mkCurry n =
          valD
            (varP $ mkName $ "curry" ++ show n)
            (normalB $ ncurry n)
            []
    mapM mkCurry [2..62]

