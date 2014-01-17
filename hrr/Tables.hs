{-# LANGUAGE TemplateHaskell, MultiParamTypeClasses #-}

module Tables where

import Database.HDBC.Query.TH (defineTableFromDB)
import Database.HDBC.Schema.MySQL (driverMySQL)
import Database.Record.TH (derivingShow)

import DataSource (connect)

$(defineTableFromDB connect driverMySQL "test" "item" [derivingShow])
