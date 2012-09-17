{-# LANGUAGE TemplateHaskell #-}
import Language.Haskell.TH

multi :: ExpQ
multi = [| \a -> (a *) |]

