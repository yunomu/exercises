class Test a where
    test :: a -> Int
    test = const 0

instance Test a => Test (b -> a) where
    test f = 1 + test (f undefined)

instance Test Int
instance Test Bool

main :: IO ()
main = do
    print $ test c
    print $ test f
    print $ test g
    print $ test h
    print $ test x
  where
    c :: Int
    c = undefined
    f :: Int -> Int
    f = undefined
    g :: Int -> Int -> Int
    g = undefined
    h :: Int -> Bool
    h = undefined
    x :: (Int -> Int -> Int) -> Bool -> Int
    x = undefined
