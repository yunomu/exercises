module THex where

import Control.Applicative
import Control.Monad
import Control.Monad.State
import Language.Haskell.TH

swapT :: Int -> Int -> Int -> ExpQ
swapT count src dst
    | src < dst && dst <= count = do
        vars <- replicateM count $ newName "x"
        lamE [tupP $ map varP vars] (tupE $ map varE $ swap src dst vars)

swap :: Int -> Int -> [a] -> [a]
swap src dst = evalState $ do
    v1 <- takeS (src - 1)
    s  <- takeS 1
    v2 <- takeS (dst - src - 1)
    d  <- takeS 1
    v3 <- get
    return $ concat [v1, d, v2, s, v3]
  where
    takeS :: Int -> State [a] [a]
    takeS n = do
        (a, b) <- splitAt n <$> get
        put b
        return a

flipT :: Int -> Int -> Int -> ExpQ
flipT count src dst
    | src < dst && dst <= count = do
        func <- newName "f"
        vars <- replicateM count $ newName "x"
        let pat = map varP $ func:vars
        let expr = foldl appE (varE func) $ map varE $ swap src dst vars
        lamE pat expr

ncurry :: Int -> ExpQ
ncurry n = do
    func <- newName "f"
    vars <- replicateM n $ newName "x"
    let pat = map varP $ func:vars
    let expr = appE (varE func) $ tupE $ map varE vars
    lamE pat expr

nuncurry :: Int -> ExpQ
nuncurry n = do
    func <- newName "f"
    vars <- replicateM n $ newName "x"
    let pat = varP func:tupP (map varP vars):[]
    let expr = foldl appE (varE func) $ map varE vars
    lamE pat expr

ncurry' :: Int -> DecQ
ncurry' n = do
    let fname = mkName $ "curry" ++ show n
    vars <- replicateM n $ newName "x"
    let pat = map varP $ fname:vars
    let tup = tupE $ map varE vars
    let body = normalB $ appE (varE fname) tup
    let fclauses = clause pat body []:[]
    funD fname fclauses

