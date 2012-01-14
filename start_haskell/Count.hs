count :: Eq a => [a] -> Int
count y (x:xs) | y == x = 1 + (count y xs)
               | otherwise = count y xs
count _ []
