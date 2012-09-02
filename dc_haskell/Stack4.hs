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
push a = put =<< (:) a <$> get

pop :: StackT a a
pop = do
    as <- get
    lift (tailEither "stack empty" as) >>= put
    return $ head as

peek :: StackT a a
peek = get >>= lift . headEither "stack empty"

headEither :: a -> [b] -> Either a b
headEither a = maybe (Left a) Right . headMay

tailEither :: a -> [b] -> Either a [b]
tailEither a = maybe (Left a) Right . tailMay

evalStack :: StackT a b -> Stack a -> StackResult a
evalStack = execStateT

empty :: Stack a
empty = []

