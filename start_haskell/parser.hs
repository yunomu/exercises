type Parser a = String -> [(a, String)]

parse :: Parser a -> String -> [(a, String)]
parse p inp = p inp

instance Monad Parser where
  return v = \inp -> [(v, inp)]
  p >>= f = \inp -> case parse  p inp of
                       [] -> []
                       [(v, out)] -> parse (f v) out

failure :: Parser a
failure = \inp -> []

item :: Parser Char
item = \inp -> case inp of
                 [] -> []
                 (x:xs) -> [(x, xs)]

(+++) :: Parser a -> Parser a -> Parser a
p +++ q = \inp -> case parse p inp of
                    [] -> parse q inp
                    [(v, out)] -> [(v, out)]

sat :: (Char -> Bool) -> Parser Char
sat p = do x <- item
           if p x then return x else failure

