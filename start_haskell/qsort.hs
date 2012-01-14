qsort :: Ord a => [a] -> [a]
qsort []     = []
qsort (x:xs) = qsort larger ++ [x] ++ smaller
               where
                 smaller = [a|a <- xs, a <= x]
                 larger  = [b|b <- xs, b > x]

product :: Num a => [a] -> a
product []     = 1
product (x:xs) = x * (product xs)

