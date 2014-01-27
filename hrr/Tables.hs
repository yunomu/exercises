{-# LANGUAGE TemplateHaskell, MultiParamTypeClasses, FlexibleInstances #-}

module Tables where

import Database.HDBC.Query.TH (defineTableFromDB)
import Database.HDBC.Schema.MySQL (driverMySQL)
import Database.HDBC.Schema.PostgreSQL (driverPostgreSQL)
import Database.Record.TH (derivingShow)

import DataSource (connect)

-- $(defineTableFromDB connect driverMySQL "test" "t" [derivingShow])
$(defineTableFromDB connect driverPostgreSQL "test" "item" [derivingShow])
