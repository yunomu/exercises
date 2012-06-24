module Stack4
    ( Stack
    , StackResult
    , push
    , pop
    , peek
    , evalStack
    , empty
    ) where

import Control.Monad.State
import Safe

type Stack a = [a]
type StackResult a = Either (String, Stack a) (Stack a)
type StackT a r = StateT (Stack a) (Either (String, Stack a)) r

push :: a -> StackT a ()
push a = do
    st <- get
    put (a:st)

pop :: StackT a a
pop = do
    st <- get
    maybe (lift $ Left ("stack empty", st)) (\v -> do
        put $ tail st
        return v
      ) $ headMay st

peek :: StackT a a
peek = do
    st <- get
    maybe (lift $ Left ("stack empty", st)) return $ headMay st

evalStack :: Stack a -> StackT a b -> StackResult a
evalStack = flip execStateT

empty :: Stack a
empty = []

