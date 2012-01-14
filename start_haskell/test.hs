double x = x + x
quadruple x = double (double x)

factorial n = product [1..n]
average ns = div (sum ns) (length ns)

add x y = x + y

add' :: Int -> (Int -> Int)
add' x y = x + y

is1 :: Int -> Bool
is1 n | n==1 = True
      | otherwise = False

factors :: Int -> [Int]
factors n = [x| x <- [1..n], (mod n x) == 0]

prime :: Int -> Bool
prime n = factors n == [1,n]

insert :: Ord a => a -> [a] -> [a]
insert x []     = [x]
insert x (y:ys) | x <= y    = x:y:ys
                | otherwise = y:insert x ys

isort :: Ord a => [a] -> [a]
isort [] = []
isort (x:xs) = insert x (isort xs)

qsort :: Ord a => [a] -> [a]
qsort [] = []
qsort (x:xs) = qsort lower ++ [x] ++ qsort upper
               where
                 lower = [a| a <- xs, a <= x]
                 upper = [b| b <- xs, b > x]

fibonacci :: Int -> Int
fibonacci 0 = 0
fibonacci 1 = 1
fibonacci n = fibonacci (n-2) + fibonacci (n-1)

