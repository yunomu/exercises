{-# LANGUAGE TemplateHaskell, QuasiQuotes #-}

module Main where

import Control.Monad (forM_)
import Github.Issues (Milestone(..))
import qualified Github.Issues.Milestones as Github

main :: IO ()
main = do
    ems <- Github.milestones "rails" "rails"
    case ems of
        Left err -> error $ show err
        Right ms -> forM_ ms $ \m -> do 
            let closed = fromIntegral $ milestoneClosedIssues m
            let open = fromIntegral $ milestoneOpenIssues m
            putStrLn $ concat
                [ "milestone"
                , show $ milestoneNumber m
                , ": "
                , show $ truncate $ (closed / (closed + open)) * 100
                , "%"
                ]
