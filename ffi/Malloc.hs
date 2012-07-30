module Main where

import Foreign.C.Types
import Foreign.Ptr

data CVoid

foreign import ccall "malloc" c_malloc :: CSize -> IO (Ptr CVoid)
foreign import ccall "free" c_free :: Ptr CVoid -> IO ()

malloc :: Int -> IO (Ptr CVoid)
malloc size = c_malloc $ fromIntegral size

free :: Ptr CVoid -> IO ()
free ptr = c_free ptr

cast :: Ptr CVoid -> Ptr CInt
cast p = castPtr p

main :: IO ()
main = do
    p <- malloc 0x1000
    print p
    print $ nullPtr
    free p

