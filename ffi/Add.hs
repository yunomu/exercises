module Main where

import Foreign.C.Types

foreign import ccall "add" c_add :: CInt -> CInt -> CInt

cAdd :: Int -> Int -> Int
cAdd a b = fromIntegral $ c_add (fromIntegral a) (fromIntegral b)

main :: IO ()
main = do
    print $ cAdd 0 1
    print $ cAdd 3 5

