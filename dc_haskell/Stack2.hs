
module Stack2 (Stack, empty, push, pop, peek) where

import Maybe

data Stack a = Stack [a]

empty :: Stack a
empty = Stack []

push :: Stack a -> a -> Stack a
push (Stack s) a = Stack (a:s)

pop :: Stack a -> Maybe (a, Stack a)
pop (Stack [])     = Nothing
pop (Stack (a:as)) = Just (a, Stack as)

peek :: Stack a -> Maybe a
peek (Stack [])     = Nothing
peek (Stack (a:as)) = Just a

