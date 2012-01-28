
> data Tree = Leaf Int | Node Tree Tree

Tree型で、木の個数は節の個数よりも常に1多いことを数学的帰納法により示す。

> countLeaf :: Tree -> Int
> countLeaf (Leaf _)   = 1
> countLeaf (Node l r) = (countLeaf l) + (countLeaf r)

> countNode :: Tree -> Int
> countNode (Leaf _)   = 0
> countNode (Node l r) = (countNode l) + (countNode r) + 1

Tree t => countLeaf t = (countNode t) + 1
を示す。

(1) Tree t => t = Leaf n のとき
countLeaf (Leaf n) = 1
countNode (Leaf n) = 0

(2) Tree t1, t2について
Tree t1 => countLeaf t1 = (countNode t1) + 1
Tree t2 => countLeaf t2 = (countNode t2) + 1
が成り立つと仮定する。

Tree x => x = Node t1 t2とする。
countLeaf x = countLeaf (Node t1 t2)
            = (countLeaf t1) + (countLeaf t2)
            = (countNode t1) + 1 + (countNode t2) + 1   #仮定より
            = ((countNode t1) + (countNode t2) + 1) + 1
            = (countNode (Node t1 t2)) + 1              #countNodeの定義より
            = (countNode x) + 1
おわり

