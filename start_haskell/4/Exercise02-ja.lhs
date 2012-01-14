「プログラミングHaskell」：第8章：問題2
=======================================

このファイルは文芸的プログラミングの形式で書いている。このファイルの中に関数を
定義して、含まれているテストで確認せよ。

次のモジュール定義とインポートを無視する。

> module Main (main) where
>
> -- hunit
> import Test.HUnit
>
> -- local
> import Parsing

以下に答えを定義せよ。

> comment :: Parser ()
> comment = do string "--"
>              many (sat (/= '\n'))
>              return ()

テストのコマンド： `runTests commentTests`

> commentTests :: [Test]
> commentTests = map TestCase
>   [ assertEqual "parse comment \"-- Comment\""
>                 [((),"")]
>                 (parse comment "-- Comment")
>   , assertEqual "parse comment \"a-- Comment\""
>                 []
>                 (parse comment "a-- Comment")
>   , assertEqual "parse comment \"-- Comment\na\""
>                 [((),"\na")]
>                 (parse comment "-- Comment\na")
>   ]

> runTests :: [Test] -> IO Counts
> runTests ts = runTestTT $ TestList ts

> main :: IO Counts
> main = runTests commentTests
