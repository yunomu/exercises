module Main where

import System.Log.Formatter
import System.Log.Handler (setFormatter)
import System.Log.Handler.Simple
import System.Log.Logger
import System.IO

main :: IO ()
main = do
    updateGlobalLogger "debug" $ setLevel DEBUG
    debugM "debug" "debugdebug"
    infoM "debug" "debuginfo"

    updateGlobalLogger "info" $ setLevel INFO
    debugM "info" "infodebug"
    infoM "info" "infoinfo"

    let fmt = "$time: [$prio] $msg"
    hdebug <- streamHandler stdout DEBUG >>= \h -> return $
        setFormatter h $ simpleLogFormatter fmt
    removeAllHandlers
    updateGlobalLogger "format"
        $ addHandler hdebug
        . setLevel DEBUG
    debugM "format" "formatdebug"
    infoM "format" "formatinfo"
