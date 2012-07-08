module TupTH where

import Language.Haskell.TH
import Control.Monad

sel :: Int -> Int -> ExpQ
sel count n = do
    vars <- replicateM count $ newName "x"
    lamE [tupP $ map varP vars] (varE $ vars !! (n - 1))

sel2 :: Int -> Int -> ExpQ
sel2 count n
    | count >= n = do
        var <- newName "x"
        let pats = replicate (n - 1) wildP
                 ++ [varP var] 
                 ++ replicate (count - n) wildP
        lamE [conP (tupleDataName count) pats] (varE var)

