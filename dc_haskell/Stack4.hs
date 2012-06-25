module Stack4
    ( Stack
    , StackResult
    , push
    , pop
    , peek
    , evalStack
    , empty
    ) where

import Control.Applicative hiding (empty)
import Control.Monad.State

type Stack a = [a]
type StackResult a = Either String (Stack a)
type StackT a = StateT (Stack a) (Either String)

push :: a -> StackT a ()
push a = get >>= \as -> put (a:as)

pop :: StackT a a
pop = get >>= f
  where
    f []     = lift $ Left "stack empty"
    f (a:as) = put as >> return a

peek :: StackT a a
peek = get >>= f
  where
    f []    = lift $ Left "stack empty"
    f (a:_) = return a

evalStack :: StackT a b -> Stack a -> StackResult a
evalStack = execStateT

empty :: Stack a
empty = []

