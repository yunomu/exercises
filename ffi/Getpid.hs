module Main where

import Control.Applicative
import Foreign.C.Types

foreign import ccall "getpid" c_getpid :: IO CInt

getpid :: IO Int
getpid = fromIntegral <$> c_getpid

