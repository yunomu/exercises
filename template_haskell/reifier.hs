{-# LANGUAGE TemplateHaskell #-}
import Language.Haskell.TH

do
    info <- reify 'curry
    runIO $ print info
    return []

