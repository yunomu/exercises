import Control.Applicative hiding ((<|>), many)
import Control.Monad
import Data.Char
import Text.Parsec
import Text.Parsec.String
import System.IO

import Grep

-- n.n.n.n # (0 <= n <= 255)
ipv4addr :: Parser String
ipv4addr = sepByNS 4 byte (char '.')
  where
    byte :: Parser String
    byte = do
        n <- many1 digit
        when ((read n) > 255) $ unexpected "IPv4 should be 0-255"
        return n

    -- p (sep p){n-1}
    sepByNS :: Int -> Parser String -> Parser Char -> Parser String
    sepByNS n p sep
        | n <= 0    = return []
        | otherwise = foldl (++) "" <$> sepByNS'
      where
        sepByNS' = (:) <$> p <*> count (n-1) sepp
        sepp = (:) <$> sep <*> p

main :: IO ()
main = do
    ls <- grep stdin ipv4addr
    mapM_ putStrLn ls

