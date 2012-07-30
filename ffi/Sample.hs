module Main where

import Foreign.C.Types

foreign import ccall "sin" c_sin :: CDouble -> CDouble

cSin :: Double -> Double
cSin = realToFrac . c_sin . realToFrac

main :: IO ()
main = do
    print $ cSin 0
    print $ cSin (pi / 2)

