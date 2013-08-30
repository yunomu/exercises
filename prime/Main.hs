
prime :: [Int]
prime = p (2:[3,5..])
  where
--    p (x:xs) = x:p (filter (f x) xs)
    p (x:xs) = p' [x] xs
    p' (x:xs) ys = x:p' (xs ++ ps) (filter (f x) qs)
      where
        (ps, qs) = span g ys
        g a = x * x > a
    f x a = x * x > a || mod a x /= 0

main :: IO ()
main =
    mapM_ print $ takeWhile (<= 20130900) prime
    --print $ last $ takeWhile (<= 20130900) prime
