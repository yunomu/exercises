
import Text.CSV

type Node = (Int, Int, Int)
data Tree = T (Node, [Tree]) deriving (Show)

main :: IO ()
main = do
    csv <- parseCSVFromFile "test.dat"
    either parseError proc csv

proc :: CSV -> IO ()
--proc = printTree . sortTree . construct . csvToNodeList
proc = out . flatten . sortTree . construct . csvToNodeList

parseError :: Show a => a -> IO ()
parseError err = do
    putStr "ParseError: "
    putStrLn . show $ err

printTree :: [Tree] -> IO ()
--printTree = putStrLn . show
printTree = pt' ""
            where
              pt' :: String -> [Tree] -> IO ()
              pt' _ []               = return ()
              pt' indentStr (T (n, cs):ts) = do
                putStr indentStr
                printNodeLn n
                pt' (' ':indentStr) cs
                pt' indentStr ts

out :: [(Node, Int)] -> IO ()
out []                 = return ()
out ((node, level):ns) = do
    indent level
    printNodeLn node
    out ns
  where
    indent :: Int -> IO ()
    indent 0 = return ()
    indent l = do putChar ' '
                  indent (l-1)

printNode :: Node -> IO ()
printNode = putStr . show

printNodeLn :: Node -> IO ()
printNodeLn n = do
    printNode n
    putStrLn ""

csvToNodeList :: CSV -> [Node]
csvToNodeList = map recordToNode . initIf (==[""]) . tail

initIf :: (a -> Bool) -> [a] -> [a]
initIf f [x]
    | f x       = []
    | otherwise = [x]
initIf f (x:xs) = x:initIf f xs

recordToNode :: Record -> Node
recordToNode x = (i, l, r)
                 where
                   [i, l, r] = map read x

isSubset :: Node -> Node -> Bool
isSubset p c = lft p < lft c && rgt c < rgt p

idx :: Node -> Int
idx (i, _, _) = i

lft :: Node -> Int
lft (_, l, _) = l

rgt :: Node -> Int
rgt (_, _, r) = r

construct :: [Node] -> [Tree]
construct []     = []
construct (x:xs) = (T (x, construct as)):construct bs
                   where
                     (as, bs) = filter2 (isSubset x) xs

filter2 :: (a -> Bool) -> [a] -> ([a], [a])
filter2 _ [] = ([], [])
filter2 f xs = (filter f xs, filter (not . f) xs)

sortTree :: [Tree] -> [Tree]
--sortTree = id
sortTree [] = []
sortTree ts = sort cmp $ map sortChild ts
              where
                cmp :: Tree -> Tree -> Bool
                cmp (T (n1, _)) (T (n2, _)) = idx n1 < idx n2

                sortChild :: Tree -> Tree
                sortChild (T (n, cs)) = T (n, sortTree cs)

sort :: (a -> a -> Bool) -> [a] -> [a]
sort _ []     = []
sort f (x:xs) = insert x (sort f xs)
                where
                  insert a []     = [a]
                  insert a (b:bs)
                    | f a b     = a:b:bs
                    | otherwise = b:insert a bs

flatten :: [Tree] -> [(Node, Int)]
flatten t = f' t 0
            where
              f' :: [Tree] -> Int -> [(Node, Int)]
              f' []             _ = []
              f' (T (n, cs):ts) d = (n, d):f' cs (d+1) ++ f' ts d

