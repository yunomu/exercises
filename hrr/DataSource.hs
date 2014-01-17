module DataSource
    ( connect
    ) where

import Database.HDBC.MySQL (MySQLConnectInfo(..), Connection, connectMySQL, defaultMySQLConnectInfo)

connect :: IO Connection
connect = connectMySQL defaultMySQLConnectInfo
