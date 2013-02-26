module TH where

import Control.Applicative
import Language.Haskell.TH

upd :: Name -> ExpQ
upd label = do
    f <- newName "func"
    r <- newName "rec"
    lamE (pat f r) (expr f r)
  where
    pat f r = [varP f, varP r]
    expr f r = recUpdE (varE r) [(,) label <$> dat f r]
    dat f r = appE (varE f) (appE (varE label) (varE r))
