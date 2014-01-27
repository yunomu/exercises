{-# LANGUAGE TemplateHaskell, QuasiQuotes #-}

module Main where

import Control.Monad (forM_)
import qualified Data.ByteString as BS
import Data.ByteString.Char8 ()
import Github.Issues (GithubAuth(..), Milestone(..))
import qualified Github.Issues.Milestones as Github
import Text.Config (config, mkConfig)
import Text.Parsec (parse)

mkConfig "authParser" [config|
GithubUser
    user ByteString
    pass ByteString
|]

main :: IO ()
main = do
    str <- BS.readFile "user"
    auth <- case parse authParser "auth" str of
        Left err -> fail $ show err
        Right a  -> return a
    ems <- Github.milestones' (Just $ GithubBasicAuth (user auth) (pass auth)) "worksap-ate" "wc3"
    case ems of
        Left err -> error $ show err
        Right ms -> forM_ ms $ \m -> do 
            let closed = fromIntegral $ milestoneClosedIssues m
            let open = fromIntegral $ milestoneOpenIssues m
            putStr "milestone"
            putStr $ show $ milestoneNumber m
            putStr ": "
            putStr $ show $ truncate $ (closed / (closed + open)) * 100
            putStrLn "%"
