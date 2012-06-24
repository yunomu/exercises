module Stack3
    ( Stack
    , push
    , pop
    , peek
    , peek'
    , evalStack
    , empty
    ) where

import Control.Monad.State

type Stack a = [a]

push :: a -> State [a] ()
push a = do
    st <- get
    put (a:st)

pop :: State [a] a
pop = do
    st <- get
    maybe (fail "stack empty") (\v -> do
        put $ tail st
        return v
      ) $ headMay st

peek :: State [a] a
peek = do
    st <- get
    maybe (fail "stack empty") return $ headMay st

peek' :: Stack a -> Maybe a
peek' s = headMay s

evalStack :: Stack a -> State [a] b -> Stack a
evalStack = flip execState

empty :: Stack a
empty = []

headMay :: [a] -> Maybe a
headMay []    = Nothing
headMay (a:_) = Just a

