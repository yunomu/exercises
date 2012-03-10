module Grep (grep) where

import Control.Applicative hiding ((<|>), many)
import Control.Monad
import Text.Parsec
import Text.Parsec.String
import System.IO
import System.IO.Error hiding (try)

matchLine :: Parser String -> Parser String
matchLine p = try matchLine' <|> ((:) <$> anyChar <*> (matchLine p))
  where
    matchLine' :: Parser String
    matchLine' = (++) <$> p <*> many anyChar

grep :: Handle -> Parser String -> IO [String]
grep h p = grep' []
  where
    grep' :: [String] -> IO [String]
    grep' ss = catch (grep'' ss) (eofError ss)

    grep'' ss = do
        l <- hGetLine h
        lss <- case parse (matchLine p) "" l of
          Left err -> return ss
          Right s  -> return (ss ++ [s])
        grep' lss

    eofError :: a -> IOError -> IO a
    eofError a e = if isEOFError e then return a else ioError e

