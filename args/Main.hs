{-# LANGUAGE DeriveDataTypeable #-}
module Main where

import System.Console.CmdArgs

data Option = Option
    { optLabel :: String
    , optSize :: Maybe Int
    } deriving (Show, Data, Typeable)

option :: Option
option = Option
	{ optLabel = "no label"
	  &= name "label"
	  &= explicit
	  &= help "Name of label"
	, optSize = Nothing
	  &= name "size"
	  &= explicit
	  &= help "Size of struct"
	}
	&= summary "CmdArgs sample"
	&= program "cmdargs"

main :: IO ()
main = cmdArgs option >>= print
