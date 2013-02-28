{-# LANGUAGE TemplateHaskell, QuasiQuotes #-}

module TH where

import Control.Applicative
import Language.Haskell.TH

-- \f r -> r { label = f (label r) }
upd :: Name -> ExpQ
upd label = do
    f <- newName "func"
    r <- newName "rec"
    lamE
        [varP f, varP r]
        (recUpdE
            (varE r)
            [(,) label <$> [|$(varE f) ($(varE label) $(varE r))|]]
        )
