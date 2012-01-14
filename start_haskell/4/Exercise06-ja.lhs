「プログラミングHaskell」：第8章：問題6
=======================================

このファイルは文芸的プログラミングの形式で書いている。このファイルの中に関数を
定義して、含まれているテストで確認せよ。

「GHC 7.0.3」以上が必要。

次のモジュール定義とインポートを無視する。

> module Main (main) where
>
> -- base
> import Control.Exception (ErrorCall(..), evaluate, handleJust)
>
> -- hunit
> import Test.HUnit
>
> -- local
> import Parsing

以下に答えを定義せよ。

> expr :: Parser Int
> expr = do t <- term
>           (add' t) +++ (sub' t) +++ return t
>        where
>          add' t = do symbol "+"
>                      e <- expr
>                      return (t + e)
>          sub' t = do symbol "-"
>                      e <- expr
>                      return (t - e)

> term :: Parser Int
> term = do f <- factor
>           (mul' f) +++ (div' f) +++ return f
>        where
>          mul' f = do symbol "*"
>                      t <- term
>                      return (f * t)
>          div' f = do symbol "/"
>                      t <- term
>                      return (div f t)

> factor :: Parser Int
> factor = do symbol "("
>             e <- expr
>             symbol ")"
>             return e
>           +++ natural

> eval :: String -> Int
> eval xs = case parse expr xs of
>            [(n,[])]  -> n
>            [(_,out)] -> error ("unused input " ++ out)
>            []        -> error "invalid input"

テストのコマンド： `runTests evalTests`

> evalTests :: [Test]
> evalTests = map TestCase
>   [ assertEqual "eval \"1\"" 1 (eval "1")
>   , assertEqual "eval \"2 * 3\"" 6 (eval "2 * 3")
>   , assertEqual "eval \"4 / 2\"" 2 (eval "4 / 2")
>   , assertEqual "eval \"3 + 2\"" 5 (eval "3 + 2")
>   , assertEqual "eval \"3 - 2\"" 1 (eval "3 - 2")
>   , assertEqual "eval \"(1 + 2 - 3)\"" 0 (eval "(1 + 2 - 3)")
>   , assertEqual "eval \"2 * 3 + 4\"" 10 (eval "2 * 3 + 4")
>   , assertEqual "eval \"2 * (3 + 4)\"" 14 (eval "2 * (3 + 4)")
>   , assertEqual "eval \"8 / 4 - 2\"" 0 (eval "8 / 4 - 2")
>   , assertEqual "eval \"8 / (4 - 2)\"" 4 (eval "8 / (4 - 2)")
>   , assertError "eval \"a1\"" (eval "a1")
>   , assertError "eval \"1a\"" (eval "1a")
>   ]

> assertError :: String -> a -> Assertion
> assertError msg x = handleJust errorCalls (const $ return ()) $ do
>     evaluate x
>     assertFailure $ msg Prelude.++ ": error not thrown"
>   where
>     errorCalls (ErrorCall _) = Just ()

> runTests :: [Test] -> IO Counts
> runTests ts = runTestTT $ TestList ts

> main :: IO Counts
> main = runTests evalTests
