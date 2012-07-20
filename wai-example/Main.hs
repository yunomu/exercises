{-# LANGUAGE OverloadedStrings #-}

import Network.Wai
import Network.Wai.Handler.Warp
import Network.HTTP.Types
import Blaze.ByteString.Builder.Char.Utf8

server :: Application
server _ = return $ ResponseBuilder status200 [] $ fromString "abcde"

main :: IO ()
main = do
    run 8080 server

