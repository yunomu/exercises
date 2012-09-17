import Control.Monad.ST
import Data.STRef

import Control.Monad.Reader
import Data.Map

aaa :: Int -> Int
aaa a = runST $ do
    b <- newSTRef a
    writeSTRef b 11
    readSTRef b

rrr :: Int -> Int
rrr a = flip runReader (a, 11) $ do
    r <- local (\(a, b) -> (a + 1, b)) ask
    reader fst
    return $ fst r

main :: IO ()
main = do
    print $ aaa 1
    print $ rrr 1

