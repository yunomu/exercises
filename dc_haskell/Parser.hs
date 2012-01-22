-- "Programming in Haskell"
-- Sec.8

module Parser (Parser, parse, int) where

import Char
import Monad

newtype Parser a =  P (String -> [(a,String)])

instance Monad Parser where
    return v = P (\inp -> [(v,inp)])
    p >>= f  = P (\inp -> case parse p inp of
                             [] -> []
                             [(v,out)] -> parse (f v) out)

instance MonadPlus Parser where
    mzero     = P (\inp -> [])
    mplus p q = P (\inp -> case parse p inp of
                              [] -> parse q inp
                              [(v,out)] -> [(v,out)])

parse :: Parser a -> String -> [(a,String)]
parse (P p) inp = p inp

failure :: Parser a
failure = mzero

item :: Parser Char
item = P (\inp -> case inp of
                    []     -> []
                    (x:xs) -> [(x,xs)])

(+++) :: Parser a -> Parser a -> Parser a
p +++ q = mplus p q

sat :: (Char -> Bool) -> Parser Char
sat p = do x <- item
           if p x then return x else failure

digit :: Parser Char
digit = sat isDigit

char :: Char -> Parser Char
char x = sat (== x)

many :: Parser a -> Parser [a]
many p = many1 p +++ return []

many1 :: Parser a -> Parser [a]
many1 p = do v  <- p
             vs <- many p
             return (v:vs)

nat :: Parser Int
nat = do xs <- many1 digit
         return (read xs)

int :: Parser Int
int = do char '-'
         n <- nat
         return (-n)
       +++ nat

