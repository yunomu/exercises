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
import Safe

type Stack a = [a]
type StackResult a = Either String (Stack a)
type StackT a = StateT (Stack a) (Either String)

push :: a -> StackT a ()
push a = get >>= \as -> put (a:as)

pop :: StackT a a
pop = do
    as <- get
    a <- lift $ headEither "stack empty" as
    put $ tail as
    return a

peek :: StackT a a
peek = get >>= lift . headEither "stack empty"

headEither :: a -> [b] -> Either a b
headEither a = maybe (Left a) Right . headMay

evalStack :: StackT a b -> Stack a -> StackResult a
evalStack = execStateT

empty :: Stack a
empty = []

