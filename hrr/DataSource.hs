module DataSource
    ( connect
    ) where

--import Database.HDBC.MySQL (MySQLConnectInfo(..), Connection, connectMySQL, defaultMySQLConnectInfo)
--
--connect :: IO Connection
--connect = connectMySQL defaultMySQLConnectInfo
--    { mysqlHost = "wc3devnom.cwdso0wbepkn.ap-northeast-1.rds.amazonaws.com"
--    , mysqlUser = "wc3"
--    , mysqlPassword = "worksapwc3"
--    , mysqlDatabase = "test"
--    }

import Database.HDBC.PostgreSQL (connectPostgreSQL, Connection)

connect :: IO Connection
connect = connectPostgreSQL "dbname=mydb"
