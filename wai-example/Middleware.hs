{-# LANGUAGE OverloadedStrings #-}

import Network.Wai
import Network.Wai.Handler.Warp
import Network.HTTP.Types
import Blaze.ByteString.Builder.Char.Utf8

server :: Application
server _ = return $ ResponseBuilder status200 [] $ fromString "hello"

middleware :: Middleware
middleware app request = do
    if requestMethod request == "MOGE"
      then return $ ResponseBuilder status200 [] $ fromString res
      else app request
  where
    res = show $ pathInfo request

main :: IO ()
main = run 8080 $ middleware server

