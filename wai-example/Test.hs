{-# LANGUAGE OverloadedStrings #-}

import Network.Wai
import Network.Wai.Handler.Warp
import Network.Wai.Test
import Network.HTTP.Types
import Blaze.ByteString.Builder.Char.Utf8

server :: Application
server _ = return $ ResponseBuilder status200 [] $ fromString "hello"

middleware :: Middleware
middleware app request = do
    if requestMethod request == "HOMU"
      then fail "fail"
      else app request

main :: IO ()
main = do
    let req = request defaultRequest {requestMethod = "HOMU"}
    res <- runSession req $ middleware server
    print res

