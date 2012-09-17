module Heredoc where

import Language.Haskell.TH
import Language.Haskell.TH.Quote

hd :: QuasiQuoter
hd = QuasiQuoter
    { quoteExp = stringE
    , quotePat = undefined
    , quoteType = undefined
    , quoteDec = undefined
    }

