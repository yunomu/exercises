{-# LANGUAGE OverloadedStrings #-}

import Network.Wai
import Network.Wai.Test
import Network.HTTP.Types
import Blaze.ByteString.Builder.Char.Utf8

server :: Application
server _ = return $ ResponseBuilder status200 [] $ fromString "hello"

middleware :: Middleware
middleware app req = do
    if requestMethod req == "MOGE"
      then return $ ResponseBuilder status200 [] $ fromString res
      else app req
  where
    res = show $ pathInfo req

main :: IO ()
main = do
    let req = request defaultRequest {requestMethod = "MOGE"}
    res <- runSession req $ middleware server
    print res

