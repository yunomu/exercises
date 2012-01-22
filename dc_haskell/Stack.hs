module Stack (Stack, empty, push, pop, peek) where

data Stack a = Stack [a]

empty :: Stack a
empty = Stack []

push :: Stack a -> a -> Stack a
push (Stack s) a = Stack (a:s)

pop :: Stack a -> (a, Stack a)
pop (Stack [])     = error "emptye stack"
pop (Stack (a:as)) = (a, (Stack as))

peek :: Stack a -> a
peek (Stack [])     = error "emptye stack"
peek (Stack (a:as)) = a

